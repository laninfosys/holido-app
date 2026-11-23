import 'package:flutter/material.dart';
import '../models/captain_models.dart';
import '../services/captain_socket_service.dart';

class ActiveTripScreen extends StatefulWidget {
  final ActiveTrip trip;

  const ActiveTripScreen({Key? key, required this.trip}) : super(key: key);

  @override
  State<ActiveTripScreen> createState() => _ActiveTripScreenState();
}

class _ActiveTripScreenState extends State<ActiveTripScreen> {
  late ActiveTrip _trip;
  final TextEditingController _otpController = TextEditingController();
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _trip = widget.trip;
  }

  void _markArrived() {
    setState(() {
      _trip.status = 'ARRIVED';
    });
    CaptainSocketService.notifyArrived(_trip.rideId);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Customer notified of your arrival!')),
    );
  }

  void _showOtpDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Enter 4-Digit Customer OTP', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Ask customer for the OTP displayed on their Holido app to start the trip.'),
            const SizedBox(height: 16),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 8),
              decoration: InputDecoration(
                counterText: '',
                filled: true,
                fillColor: const Color(0xFFF1F2F6),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFFC107),
              foregroundColor: Colors.black,
            ),
            onPressed: () {
              final otp = _otpController.text.trim();
              if (otp.length == 4) {
                Navigator.pop(ctx);
                _verifyAndStart(otp);
              }
            },
            child: const Text('VERIFY & START', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _verifyAndStart(String otp) {
    CaptainSocketService.verifyOtpAndStart(_trip.rideId, otp, callback: (success, error) {
      if (!success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.red, content: Text(error ?? 'Invalid OTP! Please try again.')),
        );
      }
    });

    // Locally mark in progress for smooth UI responsiveness
    setState(() {
      _trip.status = 'IN_PROGRESS';
    });
  }

  void _completeRide() {
    CaptainSocketService.completeRide(_trip.rideId);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Ride Completed! 🏆', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.currency_rupee, size: 48, color: Colors.green),
            const SizedBox(height: 8),
            Text(
              'Collect ₹${_trip.fare.toInt()} from Customer',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            const Text('Cash or UPI QR payment.'),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFFC107)),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context); // back to dashboard
            },
            child: const Text('Payment Received', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E1E),
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Text(
          _trip.status == 'IN_PROGRESS' ? 'On Trip to Destination' : 'Heading to Pickup',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.navigation, color: Color(0xFFFFC107)),
            onPressed: () {
              // Open external Google Maps navigation
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Simulated Dark-theme Map area
          Expanded(
            child: Container(
              color: const Color(0xFF2A2A2A),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.navigation, size: 60, color: Color(0xFFFFC107)),
                    const SizedBox(height: 12),
                    Text(
                      _trip.status == 'IN_PROGRESS'
                          ? 'Dropping off at: ${_trip.dropAddress}'
                          : 'Picking up: ${_trip.pickupAddress}',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Control Sheet
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Colors.black12,
                      child: const Icon(Icons.person, color: Colors.black),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_trip.customerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Text('Est. Earning: ₹${(_trip.fare * 0.8).toInt()}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.phone, color: Colors.green, size: 28),
                      onPressed: () {},
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Dynamic Action Button based on trip state
                if (_trip.status == 'ASSIGNED')
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _markArrived,
                      child: const Text('I HAVE ARRIVED AT PICKUP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ),
                  )
                else if (_trip.status == 'ARRIVED')
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFC107),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _showOtpDialog,
                      child: const Text('ENTER START OTP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  )
                else if (_trip.status == 'IN_PROGRESS')
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _completeRide,
                      child: const Text('COMPLETE TRIP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
