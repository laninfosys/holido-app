import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../models/models.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:4000';
  static IO.Socket? socket;

  static void initializeSocket() {
    socket = IO.io(baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    socket?.onConnect((_) {
      print('Connected to Holido Real-time Dispatch Gateway');
    });
  }

  static Future<FareEstimate?> getFareEstimate(
    Coordinates pickup,
    Coordinates drop,
    String serviceType, {
    String weightCategory = 'UP_TO_2KG',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/pricing/estimate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'pickup': pickup.toJson(),
          'drop': drop.toJson(),
          'serviceType': serviceType,
          'weightCategory': weightCategory,
        }),
      );

      if (response.statusCode == 200) {
        return FareEstimate.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      print('Error fetching fare estimate: $e');
    }
    return null;
  }

  static Future<RideRequest?> requestRide(
    Coordinates pickup,
    Coordinates drop, {
    bool autoSimulate = true,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/rides/request'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'customerId': 'cust-01',
          'customerName': 'Akshay',
          'customerPhone': '+91 9876543210',
          'pickup': pickup.toJson(),
          'drop': drop.toJson(),
          'autoSimulate': autoSimulate,
        }),
      );

      if (response.statusCode == 201) {
        return RideRequest.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      print('Error requesting ride: $e');
    }
    return null;
  }
}
