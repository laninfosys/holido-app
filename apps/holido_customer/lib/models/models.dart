class Coordinates {
  final double latitude;
  final double longitude;
  final String? address;

  Coordinates({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
      };

  factory Coordinates.fromJson(Map<String, dynamic> json) => Coordinates(
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        address: json['address'] as String?,
      );
}

class Captain {
  final String id;
  final String name;
  final String phone;
  final double rating;
  final String vehicleModel;
  final String vehicleNumber;
  final Coordinates location;

  Captain({
    required this.id,
    required this.name,
    required this.phone,
    required this.rating,
    required this.vehicleModel,
    required this.vehicleNumber,
    required this.location,
  });

  factory Captain.fromJson(Map<String, dynamic> json) => Captain(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        phone: json['phone'] ?? '',
        rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
        vehicleModel: json['vehicleModel'] ?? '',
        vehicleNumber: json['vehicleNumber'] ?? '',
        location: Coordinates.fromJson(json['location'] ?? {}),
      );
}

class FareEstimate {
  final String serviceType;
  final double baseFare;
  final double distanceFare;
  final double timeFare;
  final double surgeMultiplier;
  final double platformFee;
  final double tax;
  final double totalFare;
  final double estimatedDistanceKm;
  final int estimatedTimeMin;

  FareEstimate({
    required this.serviceType,
    required this.baseFare,
    required this.distanceFare,
    required this.timeFare,
    required this.surgeMultiplier,
    required this.platformFee,
    required this.tax,
    required this.totalFare,
    required this.estimatedDistanceKm,
    required this.estimatedTimeMin,
  });

  factory FareEstimate.fromJson(Map<String, dynamic> json) => FareEstimate(
        serviceType: json['serviceType'] ?? 'BIKE_TAXI',
        baseFare: (json['baseFare'] as num?)?.toDouble() ?? 0,
        distanceFare: (json['distanceFare'] as num?)?.toDouble() ?? 0,
        timeFare: (json['timeFare'] as num?)?.toDouble() ?? 0,
        surgeMultiplier: (json['surgeMultiplier'] as num?)?.toDouble() ?? 1.0,
        platformFee: (json['platformFee'] as num?)?.toDouble() ?? 0,
        tax: (json['tax'] as num?)?.toDouble() ?? 0,
        totalFare: (json['totalFare'] as num?)?.toDouble() ?? 0,
        estimatedDistanceKm: (json['estimatedDistanceKm'] as num?)?.toDouble() ?? 0,
        estimatedTimeMin: (json['estimatedTimeMin'] as num?)?.toInt() ?? 0,
      );
}

class RideRequest {
  final String id;
  final String serviceType;
  final Coordinates pickup;
  final Coordinates drop;
  final FareEstimate fare;
  final String status;
  final String startOtp;
  final Captain? captain;

  RideRequest({
    required this.id,
    required this.serviceType,
    required this.pickup,
    required this.drop,
    required this.fare,
    required this.status,
    required this.startOtp,
    this.captain,
  });

  factory RideRequest.fromJson(Map<String, dynamic> json) => RideRequest(
        id: json['id'] ?? '',
        serviceType: json['serviceType'] ?? 'BIKE_TAXI',
        pickup: Coordinates.fromJson(json['pickup'] ?? {}),
        drop: Coordinates.fromJson(json['drop'] ?? {}),
        fare: FareEstimate.fromJson(json['fare'] ?? {}),
        status: json['status'] ?? 'SEARCHING_CAPTAIN',
        startOtp: json['startOtp'] ?? '0000',
        captain: json['captain'] != null ? Captain.fromJson(json['captain']) : null,
      );
}
