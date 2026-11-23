import { Coordinates, FareEstimate, ServiceType } from '../types';
import { GeoService } from './geo.service';

export class PricingService {
  // Pricing configuration for Holido
  private static readonly BIKE_CONFIG = {
    baseFare: 25.0, // First 1.5 km
    baseDistanceKm: 1.5,
    perKmRate: 10.0,
    perMinRate: 1.0,
    freeMinutes: 10,
    platformFee: 3.0,
    gstRate: 0.05, // 5% GST
  };

  private static readonly PARCEL_CONFIG_LIGHT = {
    // Up to 20kg (Standard)
    baseFare: 45.0,
    baseDistanceKm: 1.5,
    perKmRate: 12.0,
    perMinRate: 1.0,
    freeMinutes: 10,
    platformFee: 4.0,
    gstRate: 0.05,
  };

  private static readonly PARCEL_CONFIG_HEAVY = {
    // 20kg to 50kg
    baseFare: 75.0,
    baseDistanceKm: 1.5,
    perKmRate: 16.0,
    perMinRate: 1.0,
    freeMinutes: 10,
    platformFee: 5.0,
    gstRate: 0.05,
  };

  private static readonly PARCEL_CONFIG_CUSTOM = {
    // 50+ kg Custom Commercial Freight
    baseFare: 120.0,
    baseDistanceKm: 1.5,
    perKmRate: 20.0,
    perMinRate: 1.5,
    freeMinutes: 10,
    platformFee: 6.0,
    gstRate: 0.05,
  };
  };

  /**
   * Calculates dynamic fare estimate based on pickup, drop, service type, and surge
   */
  static calculateFare(
    pickup: Coordinates,
    drop: Coordinates,
    serviceType: ServiceType,
    weightCategory: 'UP_TO_20KG' | '20_TO_50KG' | 'CUSTOM_50_PLUS' | 'UP_TO_2KG' | 'TWO_TO_FIVE_KG' = 'UP_TO_20KG',
    surgeMultiplier: number = 1.0
  ): FareEstimate {
    const distanceKm = GeoService.calculateDistance(pickup, drop);
    const estimatedTimeMin = GeoService.estimateTravelTime(distanceKm);

    let config = this.BIKE_CONFIG;
    if (serviceType === 'PARCEL_DELIVERY') {
      if (weightCategory === 'CUSTOM_50_PLUS') {
        config = this.PARCEL_CONFIG_CUSTOM;
      } else if (weightCategory === '20_TO_50KG' || weightCategory === 'TWO_TO_FIVE_KG') {
        config = this.PARCEL_CONFIG_HEAVY;
      } else {
        config = this.PARCEL_CONFIG_LIGHT;
      }
    }

    const baseFare = config.baseFare;
    const chargeableDistance = Math.max(0, distanceKm - config.baseDistanceKm);
    const distanceFare = Math.round(chargeableDistance * config.perKmRate);

    const chargeableTime = Math.max(0, estimatedTimeMin - config.freeMinutes);
    const timeFare = Math.round(chargeableTime * config.perMinRate);

    const subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;
    const platformFee = config.platformFee;
    const tax = Math.round((subtotal + platformFee) * config.gstRate);
    const totalFare = Math.round(subtotal + platformFee + tax);

    return {
      serviceType,
      baseFare,
      distanceFare,
      timeFare,
      surgeMultiplier,
      platformFee,
      tax,
      totalFare,
      estimatedDistanceKm: distanceKm,
      estimatedTimeMin,
    };
  }
}
