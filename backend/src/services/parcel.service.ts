import { v4 as uuidv4 } from 'uuid';
import { Captain, Coordinates, ParcelRequest } from '../types';
import { PricingService } from './pricing.service';

export class ParcelService {
  private parcels: Map<string, ParcelRequest> = new Map();

  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  createParcelOrder(
    senderId: string,
    senderName: string,
    senderPhone: string,
    receiverName: string,
    receiverPhone: string,
    packageType: 'DOCUMENTS' | 'BOX' | 'ELECTRONICS' | 'CLOTHES' | 'FOOD' | 'OTHER',
    weightCategory: 'UP_TO_2KG' | 'TWO_TO_FIVE_KG',
    pickup: Coordinates,
    drop: Coordinates,
    packageInstructions?: string
  ): ParcelRequest {
    const fare = PricingService.calculateFare(
      pickup,
      drop,
      'PARCEL_DELIVERY',
      weightCategory
    );

    const parcel: ParcelRequest = {
      id: `parcel-${uuidv4().substring(0, 8)}`,
      senderId,
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      packageType,
      weightCategory,
      packageInstructions,
      pickup,
      drop,
      fare,
      status: 'SEARCHING_CAPTAIN',
      pickupOtp: this.generateOtp(),
      deliveryOtp: this.generateOtp(),
      createdAt: new Date(),
    };

    this.parcels.set(parcel.id, parcel);
    return parcel;
  }

  getParcel(parcelId: string): ParcelRequest | undefined {
    return this.parcels.get(parcelId);
  }

  assignCaptain(parcelId: string, captain: Captain): ParcelRequest | undefined {
    const parcel = this.parcels.get(parcelId);
    if (!parcel || parcel.status !== 'SEARCHING_CAPTAIN') return undefined;

    parcel.captain = captain;
    parcel.status = 'CAPTAIN_ASSIGNED';
    return parcel;
  }

  captainArrivedPickup(parcelId: string): ParcelRequest | undefined {
    const parcel = this.parcels.get(parcelId);
    if (!parcel || parcel.status !== 'CAPTAIN_ASSIGNED') return undefined;

    parcel.status = 'ARRIVED_AT_PICKUP';
    return parcel;
  }

  pickupPackage(
    parcelId: string,
    enteredOtp: string
  ): { success: boolean; parcel?: ParcelRequest; error?: string } {
    const parcel = this.parcels.get(parcelId);
    if (!parcel) return { success: false, error: 'Parcel not found' };

    if (parcel.pickupOtp !== enteredOtp) {
      return { success: false, error: 'Invalid Sender Pickup OTP' };
    }

    parcel.status = 'IN_TRANSIT';
    parcel.pickedUpAt = new Date();
    return { success: true, parcel };
  }

  deliverPackage(
    parcelId: string,
    enteredOtp: string
  ): { success: boolean; parcel?: ParcelRequest; captainEarning?: number; error?: string } {
    const parcel = this.parcels.get(parcelId);
    if (!parcel) return { success: false, error: 'Parcel not found' };

    if (parcel.deliveryOtp !== enteredOtp) {
      return { success: false, error: 'Invalid Recipient Delivery OTP' };
    }

    parcel.status = 'DELIVERED';
    parcel.deliveredAt = new Date();

    // 82% to Captain for parcel courier
    const captainEarning = Math.round(parcel.fare.totalFare * 0.82);

    return {
      success: true,
      parcel,
      captainEarning,
    };
  }
}
