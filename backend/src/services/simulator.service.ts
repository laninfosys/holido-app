import { Server } from 'socket.io';
import { CaptainService } from './captain.service';
import { GeoService } from './geo.service';
import { RideService } from './ride.service';
import { ParcelService } from './parcel.service';

export class SimulatorService {
  constructor(
    private captainService: CaptainService,
    private rideService: RideService,
    private parcelService: ParcelService,
    private getIo: () => Server
  ) {}

  /**
   * Simulates full Captain lifecycle for a bike ride
   */
  simulateBikeRide(rideId: string) {
    const ride = this.rideService.getRide(rideId);
    if (!ride) return;

    const io = this.getIo();

    // Step 1: Find nearest captain
    const nearby = this.captainService.findNearbyCaptains(ride.pickup, 10.0);
    if (nearby.length === 0) {
      io.emit(`ride:${rideId}:status`, {
        status: 'NO_CAPTAIN_FOUND',
        message: 'No Captains nearby. Try again shortly.',
      });
      return;
    }

    const assigned = nearby[0].captain;
    this.captainService.setBusyStatus(assigned.id, true);

    // Step 2: 2-second delay to emulate captain phone buzzing & accepting
    setTimeout(() => {
      this.rideService.assignCaptain(rideId, assigned);
      io.emit(`ride:${rideId}:status`, {
        status: 'CAPTAIN_ASSIGNED',
        captain: assigned,
        etaMinutes: nearby[0].etaMin,
      });

      // Step 3: Simulate Captain traveling towards pickup location
      const pathToPickup = GeoService.interpolatePath(
        assigned.location,
        ride.pickup,
        10
      );

      let stepIndex = 0;
      const pickupInterval = setInterval(() => {
        if (stepIndex < pathToPickup.length) {
          const currentPos = pathToPickup[stepIndex];
          this.captainService.updateLocation(assigned.id, currentPos);
          io.emit(`captain:${assigned.id}:location`, currentPos);
          io.emit(`ride:${rideId}:captain_location`, currentPos);
          stepIndex++;
        } else {
          clearInterval(pickupInterval);

          // Captain arrived at pickup!
          this.rideService.captainArrived(rideId);
          io.emit(`ride:${rideId}:status`, {
            status: 'CAPTAIN_ARRIVED',
            message: 'Your Holido Captain has arrived at pickup point!',
          });

          // Step 4: Captain verifies 4-digit OTP after 3 seconds
          setTimeout(() => {
            const startResult = this.rideService.startRide(rideId, ride.startOtp);
            if (startResult.success) {
              io.emit(`ride:${rideId}:status`, {
                status: 'IN_PROGRESS',
                message: 'Trip started! Have a safe ride with helmet.',
              });

              // Step 5: Simulate traveling from pickup to destination drop
              const pathToDrop = GeoService.interpolatePath(
                ride.pickup,
                ride.drop,
                15
              );

              let dropIndex = 0;
              const dropInterval = setInterval(() => {
                if (dropIndex < pathToDrop.length) {
                  const currentPos = pathToDrop[dropIndex];
                  this.captainService.updateLocation(assigned.id, currentPos);
                  io.emit(`captain:${assigned.id}:location`, currentPos);
                  io.emit(`ride:${rideId}:captain_location`, currentPos);
                  dropIndex++;
                } else {
                  clearInterval(dropInterval);

                  // Trip completed!
                  const finish = this.rideService.completeRide(rideId);
                  this.captainService.setBusyStatus(assigned.id, false);
                  if (finish.captainEarning) {
                    this.captainService.addEarnings(assigned.id, finish.captainEarning);
                  }

                  io.emit(`ride:${rideId}:status`, {
                    status: 'COMPLETED',
                    totalFare: ride.fare.totalFare,
                    captainEarning: finish.captainEarning,
                    message: 'Trip completed! Collect cash / UPI payment.',
                  });
                }
              }, 1200);
            }
          }, 3000);
        }
      }, 1000);
    }, 2000);
  }
}
