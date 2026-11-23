import { Server, Socket } from 'socket.io';
import { CaptainService } from '../services/captain.service';
import { RideService } from '../services/ride.service';
import { ParcelService } from '../services/parcel.service';
import { SimulatorService } from '../services/simulator.service';
import { Coordinates } from '../types';

export class SocketGateway {
  private io: Server;
  private simulator: SimulatorService;

  constructor(
    io: Server,
    private captainService: CaptainService,
    private rideService: RideService,
    private parcelService: ParcelService
  ) {
    this.io = io;
    this.simulator = new SimulatorService(
      captainService,
      rideService,
      parcelService,
      () => this.io
    );
    this.initializeEvents();
  }

  private initializeEvents() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket] New connection established: ${socket.id}`);

      // Captain registers socket and streams location
      socket.on('captain:register', (data: { captainId: string }) => {
        const captain = this.captainService.getCaptain(data.captainId);
        if (captain) {
          captain.socketId = socket.id;
          socket.join(`captain:${data.captainId}`);
          socket.emit('captain:registered', captain);
        }
      });

      // Captain updates live GPS coordinates
      socket.on(
        'captain:updateLocation',
        (data: { captainId: string; location: Coordinates }) => {
          const updated = this.captainService.updateLocation(
            data.captainId,
            data.location
          );
          if (updated) {
            // Broadcast location to all tracking clients
            this.io.emit(`captain:${data.captainId}:location`, data.location);
          }
        }
      );

      // Captain toggles Online / Offline status
      socket.on(
        'captain:toggleStatus',
        (data: { captainId: string; isOnline: boolean }) => {
          const updated = this.captainService.setOnlineStatus(
            data.captainId,
            data.isOnline
          );
          if (updated) {
            this.io.emit('captain:statusChanged', {
              captainId: data.captainId,
              isOnline: data.isOnline,
            });
          }
        }
      );

      // Customer creates a Bike Taxi Ride
      socket.on(
        'ride:request',
        (data: {
          customerId: string;
          customerName: string;
          customerPhone: string;
          pickup: Coordinates;
          drop: Coordinates;
          autoSimulate?: boolean;
        }) => {
          const ride = this.rideService.createRide(
            data.customerId,
            data.customerName,
            data.customerPhone,
            data.pickup,
            data.drop
          );

          socket.join(`ride:${ride.id}`);
          socket.emit('ride:created', ride);

          // Find nearby captains and alert them
          const nearby = this.captainService.findNearbyCaptains(data.pickup);
          nearby.forEach(({ captain, distanceKm, etaMin }) => {
            if (captain.socketId) {
              this.io.to(captain.socketId).emit('ride:offer', {
                rideId: ride.id,
                pickup: ride.pickup,
                drop: ride.drop,
                fare: ride.fare.totalFare,
                distanceKm,
                etaMin,
              });
            }
          });

          // If autoSimulate is true (for quick demo/testing), trigger autonomous captain bot
          if (data.autoSimulate !== false) {
            this.simulator.simulateBikeRide(ride.id);
          }
        }
      );

      // Captain accepts a Ride Offer
      socket.on(
        'ride:accept',
        (data: { rideId: string; captainId: string }) => {
          const captain = this.captainService.getCaptain(data.captainId);
          if (!captain) return;

          const updated = this.rideService.assignCaptain(data.rideId, captain);
          if (updated) {
            this.captainService.setBusyStatus(captain.id, true);
            this.io.to(`ride:${data.rideId}`).emit(`ride:${data.rideId}:status`, {
              status: 'CAPTAIN_ASSIGNED',
              captain,
            });
          }
        }
      );

      // Captain starts ride with 4-digit OTP
      socket.on(
        'ride:start',
        (data: { rideId: string; otp: string }) => {
          const result = this.rideService.startRide(data.rideId, data.otp);
          if (result.success) {
            this.io.to(`ride:${data.rideId}`).emit(`ride:${data.rideId}:status`, {
              status: 'IN_PROGRESS',
              ride: result.ride,
            });
          } else {
            socket.emit('ride:start:error', { error: result.error });
          }
        }
      );

      // Captain completes ride
      socket.on('ride:complete', (data: { rideId: string }) => {
        const result = this.rideService.completeRide(data.rideId);
        if (result.success && result.ride) {
          if (result.ride.captain) {
            this.captainService.setBusyStatus(result.ride.captain.id, false);
            if (result.captainEarning) {
              this.captainService.addEarnings(
                result.ride.captain.id,
                result.captainEarning
              );
            }
          }
          this.io.to(`ride:${data.rideId}`).emit(`ride:${data.rideId}:status`, {
            status: 'COMPLETED',
            ride: result.ride,
            captainEarning: result.captainEarning,
          });
        }
      });

      // Customer joins room to track active ride
      socket.on('ride:subscribe', (data: { rideId: string }) => {
        socket.join(`ride:${data.rideId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
      });
    });
  }
}
