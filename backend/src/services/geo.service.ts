import { Coordinates } from '../types';

export class GeoService {
  /**
   * Calculates distance in kilometers between two GPS coordinates using Haversine formula
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const lat1 = this.toRadians(coord1.latitude);
    const lat2 = this.toRadians(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Road factor: straight line distance is ~1.25x shorter than road paths
    const roadDistance = distance * 1.25;
    return Math.max(0.5, Math.round(roadDistance * 10) / 10);
  }

  /**
   * Estimates travel duration in minutes based on two-wheeler urban traffic speeds (~24 km/h)
   */
  static estimateTravelTime(distanceKm: number): number {
    const avgBikeSpeedKmh = 24.0;
    const timeHours = distanceKm / avgBikeSpeedKmh;
    const timeMinutes = Math.ceil(timeHours * 60) + 3; // +3 min buffer for signals/traffic
    return Math.max(4, timeMinutes);
  }

  /**
   * Calculates compass heading / bearing from point A to point B in degrees
   */
  static calculateBearing(from: Coordinates, to: Coordinates): number {
    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    return (brng + 360) % 360;
  }

  /**
   * Generates interpolated GPS waypoints between start and end for smooth tracking animation
   */
  static interpolatePath(from: Coordinates, to: Coordinates, steps: number = 20): Coordinates[] {
    const path: Coordinates[] = [];
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      // Slight jitter to emulate real city turns
      const jitterLat = (Math.sin(fraction * Math.PI * 4) * 0.0003);
      const jitterLng = (Math.cos(fraction * Math.PI * 4) * 0.0003);

      const lat = from.latitude + (to.latitude - from.latitude) * fraction + jitterLat;
      const lng = from.longitude + (to.longitude - from.longitude) * fraction + jitterLng;
      const heading = this.calculateBearing(from, to);

      path.push({
        latitude: lat,
        longitude: lng,
        heading,
      });
    }
    return path;
  }

  private static toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
