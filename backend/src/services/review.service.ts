export interface TripReview {
  id: string;
  tripId: string;
  serviceType: 'BIKE_TAXI' | 'PARCEL_DELIVERY';
  captainId: string;
  customerId: string;
  customerActualName: string; // Stored privately for Admin audit only
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

export interface PublicCaptainReview {
  id: string;
  rating: number;
  comment: string;
  serviceType: 'BIKE_TAXI' | 'PARCEL_DELIVERY';
  anonymousUserBadge: string; // e.g. "Holido Rider • Verified Trip" (REAL NAME HIDDEN)
  timeAgo: string;
}

export class ReviewService {
  private static reviews: TripReview[] = [
    {
      id: 'rev-01',
      tripId: 'HLD-9810',
      serviceType: 'BIKE_TAXI',
      captainId: 'cap-101',
      customerId: 'cust-11',
      customerActualName: 'Priya Sharma',
      rating: 5,
      comment: 'Very polite captain, drove safely in heavy traffic and wore sanitized helmet.',
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      id: 'rev-02',
      tripId: 'HLD-9812',
      serviceType: 'PARCEL_DELIVERY',
      captainId: 'cap-101',
      customerId: 'cust-12',
      customerActualName: 'Rohit Verma',
      rating: 5,
      comment: 'Delivered urgent laptop documents in 20 minutes without any damage!',
      createdAt: new Date(Date.now() - 3600000 * 18),
    },
    {
      id: 'rev-03',
      tripId: 'HLD-9815',
      serviceType: 'BIKE_TAXI',
      captainId: 'cap-102',
      customerId: 'cust-13',
      customerActualName: 'Manish Singh',
      rating: 4.5,
      comment: 'Good ride, reached destination on time.',
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
  ];

  static addReview(
    tripId: string,
    serviceType: 'BIKE_TAXI' | 'PARCEL_DELIVERY',
    captainId: string,
    customerId: string,
    customerActualName: string,
    rating: number,
    comment: string
  ): TripReview {
    const review: TripReview = {
      id: `rev-${Date.now()}`,
      tripId,
      serviceType,
      captainId,
      customerId,
      customerActualName,
      rating,
      comment,
      createdAt: new Date(),
    };

    this.reviews.push(review);
    console.log(`[ReviewService] New review added for Captain ${captainId} (${rating}★). Customer identity masked from driver.`);
    return review;
  }

  /**
   * Fetches reviews for Captain profile with USER NAME ANONYMIZED
   */
  static getCaptainPublicReviews(captainId: string): PublicCaptainReview[] {
    return this.reviews
      .filter((r) => r.captainId === captainId)
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        serviceType: r.serviceType,
        anonymousUserBadge:
          r.serviceType === 'PARCEL_DELIVERY'
            ? 'Verified Parcel Sender'
            : 'Verified Holido Rider', // Customer's real name is strictly HIDDEN
        timeAgo: 'Recently',
      }));
  }

  /**
   * Super Admin can view all reviews with full audit trail
   */
  static getAllReviewsForAdmin(): TripReview[] {
    return this.reviews;
  }
}
