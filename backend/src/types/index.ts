export interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
  heading?: number;
}

export type ServiceType = 'BIKE_TAXI' | 'PARCEL_DELIVERY';

export type RideStatus =
  | 'IDLE'
  | 'SEARCHING_CAPTAIN'
  | 'CAPTAIN_ASSIGNED'
  | 'CAPTAIN_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParcelStatus =
  | 'SEARCHING_CAPTAIN'
  | 'CAPTAIN_ASSIGNED'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Captain {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicleModel: string;
  vehicleNumber: string;
  location: Coordinates;
  isOnline: boolean;
  isBusy: boolean;
  totalTrips: number;
  todayEarnings: number;
  socketId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  rating: number;
}

export interface FareEstimate {
  serviceType: ServiceType;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  platformFee: number;
  tax: number;
  totalFare: number;
  estimatedDistanceKm: number;
  estimatedTimeMin: number;
}

export interface RideRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
  pickup: Coordinates;
  drop: Coordinates;
  fare: FareEstimate;
  status: RideStatus;
  startOtp: string;
  captain?: Captain;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ParcelRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  packageType: 'DOCUMENTS' | 'BOX' | 'ELECTRONICS' | 'CLOTHES' | 'FOOD' | 'OTHER';
  weightCategory: 'UP_TO_2KG' | 'TWO_TO_FIVE_KG';
  packageInstructions?: string;
  pickup: Coordinates;
  drop: Coordinates;
  fare: FareEstimate;
  status: ParcelStatus;
  pickupOtp: string;
  deliveryOtp: string;
  captain?: Captain;
  createdAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}
