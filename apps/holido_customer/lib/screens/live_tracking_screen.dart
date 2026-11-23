import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class LiveTrackingScreen extends StatefulWidget {
  final RideRequest initialRide;

  const LiveTrackingScreen({Key? key, required this.initialRide}) : super(key: key);

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  late RideRequest _ride;
  String _currentStatus = 'SEARCHING_CAPTAIN';
  Captain? _assignedCaptain;

  @override
  void initState() {
    super.initState();
    _ride = widget.initialRide;
    _currentStatus = _ride.status;
    _listenToRideEvents();
  }

  void _listenToRideEvents() {
    final socket = ApiService.socket;
    if (socket == null) return;

    socket.on('ride:${_ride.id}:status', (data) {
      if (mounted) {
        setState(() {
          _currentStatus = data['status'] ?? _currentStatus;
          if (data['captain'] != null) {
            _assignedCaptain = Captain.fromJson(data['captain']);
          }
        });

        if (_currentStatus == 'COMPLETED') {
          _showTripCompletedDialog(data['totalFare'] ?? _ride.fare.totalFare);
        }
      }
    });
  }

  void _showTripCompletedDialog(num fare) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Trip Completed! 🎉', style: TextStyle(fontWeight: FontWeight.bold)),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.grey),
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 54),
            const SizedBox(height: 10),
            Text(
              'Total Fare: ₹$fare',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            const Text('Please pay the Captain via Cash or UPI.', textAlign: TextAlign.center),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                5,
                (index) => const Icon(Icons.star, color: Colors.amber, size: 28),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: const Text(
                '🛡️ Anonymous Privacy Shield Active\nYour real name is kept strictly hidden from the Captain',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10.5, color: Color(0xFF1E40AF)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context); // Skip and back to home
            },
            child: const Text('Skip Rating', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context); // back to home
            },
            child: const Text('Submit Review', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  String _getStatusText() {
    switch (_currentStatus) {
      case 'SEARCHING_CAPTAIN':
        return 'Searching for nearby Holido Captains...';
      case 'CAPTAIN_ASSIGNED':
        return 'Captain is on the way to your pickup!';
      case 'CAPTAIN_ARRIVED':
        return 'Captain has arrived at your location!';
      case 'IN_PROGRESS':
        return 'Heading towards destination. Wear your helmet!';
      case 'COMPLETED':
        return 'Trip Completed';
      default:
        return 'Holido Ride';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F2C59),
        elevation: 0,
        title: const Text('Live Ride Tracking', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          TextButton.icon(
            onPressed: () {
              // Emergency SOS
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  backgroundColor: Colors.red,
                  content: Text('SOS Activated! Contacting Emergency Helpline & Sharing Live Location...'),
                ),
              );
            },
            icon: const Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
            label: const Text('SOS', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
          )
        ],
      ),
      body: Column(
        children: [
          // Live Status Header Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            color: Colors.black87,
            child: Row(
              children: [
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2.5, color: Color(0xFFFFC107)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _getStatusText(),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

          // Simulated Map Area
          Expanded(
            child: Container(
              color: const Color(0xFFE8ECEF),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFFFC107).withOpacity(0.2),
                          ),
                        ),
                        Container(
                          width: 90,
                          height: 90,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Color(0xFFFFC107),
                          ),
                          child: const Icon(Icons.two_wheeler, size: 48, color: Colors.black),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _assignedCaptain != null
                        ? '${_assignedCaptain!.name} • ${_assignedCaptain!.vehicleModel}'
                        : 'Matching with the closest Captain...',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Pickup: ${_ride.pickup.address ?? "Current Location"}',
                      style: const TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Sheet: Ride OTP & Captain Details
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -3)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 4-Digit OTP Box
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF2563EB), width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('START RIDE OTP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A))),
                          Text('Share only with your Captain', style: TextStyle(fontSize: 12, color: Colors.black54)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E3A8A),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _ride.startOtp,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 4,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Captain Profile & Vehicle Plate
                if (_assignedCaptain != null) ...[
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: const Color(0xFFFFC107),
                        child: const Icon(Icons.person, size: 32, color: Colors.black),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _assignedCaptain!.name,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            Row(
                              children: [
                                const Icon(Icons.star, color: Colors.amber, size: 16),
                                const SizedBox(width: 4),
                                Text(
                                  '${_assignedCaptain!.rating}',
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F2F6),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.black26),
                        ),
                        child: Text(
                          _assignedCaptain!.vehicleNumber,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: const BorderSide(color: Colors.black26),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {},
                        icon: const Icon(Icons.call, color: Colors.green),
                        label: const Text('Call Captain', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFFC107),
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          // Share live ride details
                        },
                        icon: const Icon(Icons.share, size: 18),
                        label: const Text('Share Ride', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
