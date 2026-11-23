import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../models/captain_models.dart';

class CaptainSocketService {
  static const String baseUrl = 'http://localhost:4000';
  static IO.Socket? socket;
  static const String currentCaptainId = 'cap-101';

  static void init({
    required Function(RideOffer) onNewOffer,
    required Function(String status, dynamic data) onTripStatus,
  }) {
    socket = IO.io(baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    socket?.onConnect((_) {
      print('Captain connected to Holido Dispatch Gateway');
      // Register captain ID with gateway
      socket?.emit('captain:register', {'captainId': currentCaptainId});
    });

    socket?.on('ride:offer', (data) {
      final offer = RideOffer.fromJson(data);
      onNewOffer(offer);
    });

    socket?.on('ride:status_update', (data) {
      onTripStatus(data['status'], data);
    });
  }

  static void toggleOnline(bool isOnline) {
    socket?.emit('captain:toggleStatus', {
      'captainId': currentCaptainId,
      'isOnline': isOnline,
    });
  }

  static void acceptOffer(String rideId) {
    socket?.emit('ride:accept', {
      'rideId': rideId,
      'captainId': currentCaptainId,
    });
  }

  static void notifyArrived(String rideId) {
    socket?.emit('ride:arrived', {
      'rideId': rideId,
      'captainId': currentCaptainId,
    });
  }

  static void verifyOtpAndStart(
    String rideId,
    String otp, {
    required Function(bool success, String? error) callback,
  }) {
    socket?.emit('ride:start', {
      'rideId': rideId,
      'otp': otp,
    });

    socket?.once('ride:start:error', (data) {
      callback(false, data['error']);
    });
  }

  static void completeRide(String rideId) {
    socket?.emit('ride:complete', {
      'rideId': rideId,
    });
  }
}
