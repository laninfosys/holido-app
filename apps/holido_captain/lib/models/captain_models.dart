class RideOffer {
  final String rideId;
  final String serviceType;
  final String pickupAddress;
  final String dropAddress;
  final double distanceKm;
  final int etaMin;
  final double captainEarning;
  final double pickupDistanceKm;

  RideOffer({
    required this.rideId,
    required this.serviceType,
    required this.pickupAddress,
    required this.dropAddress,
    required this.distanceKm,
    required this.etaMin,
    required this.captainEarning,
    required this.pickupDistanceKm,
  });

  factory RideOffer.fromJson(Map<String, dynamic> json) => RideOffer(
        rideId: json['rideId'] ?? '',
        serviceType: json['serviceType'] ?? 'BIKE_TAXI',
        pickupAddress: json['pickup']?['address'] ?? 'Pickup Point',
        dropAddress: json['drop']?['address'] ?? 'Destination',
        distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 3.5,
        etaMin: (json['etaMin'] as num?)?.toInt() ?? 8,
        captainEarning: ((json['fare'] as num?)?.toDouble() ?? 50.0) * 0.8,
        pickupDistanceKm: 0.8,
      );
}

class ActiveTrip {
  final String rideId;
  final String customerName;
  final String customerPhone;
  final String pickupAddress;
  final String dropAddress;
  final double fare;
  String status; // 'ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'

  ActiveTrip({
    required this.rideId,
    required this.customerName,
    required this.customerPhone,
    required this.pickupAddress,
    required this.dropAddress,
    required this.fare,
    required this.status,
  });
}
