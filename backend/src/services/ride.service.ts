import { v4 as uuidv4 } from 'uuid';
import { Captain, Coordinates, RideRequest, RideStatus } from '../types';
import { PricingService } from './pricing.service';

export class RideService {
  private rides: Map<string, RideRequest> = new Map();

  /**
   * Generates a 4-digit OTP for starting the ride
   */
  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  createRide(
    customerId: string,
    customerName: string,
    customerPhone: string,
    pickup: Coordinates,
    drop: Coordinates,
    surgeMultiplier: number = 1.0
  ): RideRequest {
    const fare = PricingService.calculateFare(
      pickup,
      drop,
      'BIKE_TAXI',
      'UP_TO_2KG',
      surgeMultiplier
    );

    const ride: RideRequest = {
      id: `ride-${uuidv4().substring(0, 8)}`,
      customerId,
      customerName,
      customerPhone,
      serviceType: 'BIKE_TAXI',
      pickup,
      drop,
      fare,
      status: 'SEARCHING_CAPTAIN',
      startOtp: this.generateOtp(),
      createdAt: new Date(),
    };

    this.rides.set(ride.id, ride);
    return ride;
  }

  getRide(rideId: string): RideRequest | undefined {
    return this.rides.get(rideId);
  }

  assignCaptain(rideId: string, captain: Captain): RideRequest | undefined {
    const ride = this.rides.get(rideId);
    if (!ride || ride.status !== 'SEARCHING_CAPTAIN') return undefined;

    ride.captain = captain;
    ride.status = 'CAPTAIN_ASSIGNED';
    return ride;
  }

  captainArrived(rideId: string): RideRequest | undefined {
    const ride = this.rides.get(rideId);
    if (!ride || ride.status !== 'CAPTAIN_ASSIGNED') return undefined;

    ride.status = 'CAPTAIN_ARRIVED';
    return ride;
  }

  startRide(rideId: string, enteredOtp: string): { success: boolean; ride?: RideRequest; error?: string } {
    const ride = this.rides.get(rideId);
    if (!ride) return { success: false, error: 'Ride not found' };

    if (ride.startOtp !== enteredOtp) {
      return { success: false, error: 'Invalid 4-digit ride OTP. Please ask customer.' };
    }

    ride.status = 'IN_PROGRESS';
    ride.startedAt = new Date();
    return { success: true, ride };
  }

  completeRide(rideId: string): { success: boolean; ride?: RideRequest; captainEarning?: number } {
    const ride = this.rides.get(rideId);
    if (!ride || ride.status !== 'IN_PROGRESS') {
      return { success: false };
    }

    ride.status = 'COMPLETED';
    ride.completedAt = new Date();

    // 80% to Captain, 20% Holido platform commission
    const captainEarning = Math.round(ride.fare.totalFare * 0.8);

    return {
      success: true,
      ride,
      captainEarning,
    };
  }

  cancelRide(rideId: string, reason?: string): RideRequest | undefined {
    const ride = this.rides.get(rideId);
    if (ride) {
      ride.status = 'CANCELLED';
      return ride;
    }
    return undefined;
  }
}
