import { Captain, Coordinates } from '../types';
import { GeoService } from './geo.service';

export class CaptainService {
  private captains: Map<string, Captain> = new Map();

  constructor() {
    this.seedDefaultCaptains();
  }

  private seedDefaultCaptains() {
    const mockCaptains: Captain[] = [
      {
        id: 'cap-101',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        rating: 4.88,
        vehicleModel: 'Hero Splendor Plus (Black)',
        vehicleNumber: 'DL 01 AB 4592',
        location: { latitude: 28.6139, longitude: 77.2090, heading: 45 },
        isOnline: true,
        isBusy: false,
        totalTrips: 1420,
        todayEarnings: 840,
      },
      {
        id: 'cap-102',
        name: 'Amit Kumar',
        phone: '+91 98111 22334',
        rating: 4.92,
        vehicleModel: 'Honda Activa 6G (Grey)',
        vehicleNumber: 'DL 04 CZ 8812',
        location: { latitude: 28.6155, longitude: 77.2115, heading: 120 },
        isOnline: true,
        isBusy: false,
        totalTrips: 980,
        todayEarnings: 620,
      },
      {
        id: 'cap-103',
        name: 'Vikram Singh',
        phone: '+91 97222 33445',
        rating: 4.75,
        vehicleModel: 'Bajaj Pulsar 150 (Blue)',
        vehicleNumber: 'DL 03 BK 1109',
        location: { latitude: 28.6110, longitude: 77.2070, heading: 270 },
        isOnline: true,
        isBusy: false,
        totalTrips: 2150,
        todayEarnings: 1150,
      },
      {
        id: 'cap-104',
        name: 'Suresh Patel',
        phone: '+91 99333 44556',
        rating: 4.81,
        vehicleModel: 'TVS Jupiter (White)',
        vehicleNumber: 'DL 08 EF 6721',
        location: { latitude: 28.6180, longitude: 77.2050, heading: 180 },
        isOnline: true,
        isBusy: false,
        totalTrips: 640,
        todayEarnings: 450,
      },
    ];

    mockCaptains.forEach((c) => this.captains.set(c.id, c));
  }

  getCaptain(id: string): Captain | undefined {
    return this.captains.get(id);
  }

  getAllCaptains(): Captain[] {
    return Array.from(this.captains.values());
  }

  updateLocation(captainId: string, location: Coordinates): Captain | undefined {
    const captain = this.captains.get(captainId);
    if (captain) {
      captain.location = { ...location };
      return captain;
    }
    return undefined;
  }

  setOnlineStatus(captainId: string, isOnline: boolean): Captain | undefined {
    const captain = this.captains.get(captainId);
    if (captain) {
      captain.isOnline = isOnline;
      return captain;
    }
    return undefined;
  }

  setBusyStatus(captainId: string, isBusy: boolean): Captain | undefined {
    const captain = this.captains.get(captainId);
    if (captain) {
      captain.isBusy = isBusy;
      return captain;
    }
    return undefined;
  }

  addEarnings(captainId: string, amount: number): Captain | undefined {
    const captain = this.captains.get(captainId);
    if (captain) {
      captain.todayEarnings += amount;
      captain.totalTrips += 1;
      return captain;
    }
    return undefined;
  }

  /**
   * Finds online, available captains within radius (default 5.0 km) sorted by distance
   */
  findNearbyCaptains(
    location: Coordinates,
    radiusKm: number = 5.0
  ): { captain: Captain; distanceKm: number; etaMin: number }[] {
    const available = Array.from(this.captains.values()).filter(
      (c) => c.isOnline && !c.isBusy
    );

    const matches: { captain: Captain; distanceKm: number; etaMin: number }[] = [];

    for (const captain of available) {
      const distanceKm = GeoService.calculateDistance(location, captain.location);
      if (distanceKm <= radiusKm) {
        matches.push({
          captain,
          distanceKm,
          etaMin: GeoService.estimateTravelTime(distanceKm),
        });
      }
    }

    return matches.sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
