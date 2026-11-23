import 'dart:async';
import 'package:flutter/material.dart';
import '../models/captain_models.dart';
import '../services/captain_socket_service.dart';
import 'active_trip_screen.dart';

class CaptainDashboard extends StatefulWidget {
  const CaptainDashboard({Key? key}) : super(key: key);

  @override
  State<CaptainDashboard> createState() => _CaptainDashboardState();
}

class _CaptainDashboardState extends State<CaptainDashboard> {
  bool _isOnline = true;
  RideOffer? _currentOffer;
  Timer? _countdownTimer;
  int _secondsLeft = 15;
  String _selectedVehicleType = 'BIKE'; // BIKE, AUTO, CAR
  String _vehicleName = 'Hero Splendor';
  String _plateNumber = 'DL 01 AB 4592';
  IconData _vehicleIcon = Icons.two_wheeler;

  double _todayEarnings = 840.0;
  int _completedTrips = 7;

  @override
  void initState() {
    super.initState();
    CaptainSocketService.init(
      onNewOffer: (offer) {
        if (_isOnline && mounted) {
          _showIncomingOffer(offer);
        }
      },
      onTripStatus: (status, data) {},
    );
  }

  void _showIncomingOffer(RideOffer offer) {
    setState(() {
      _currentOffer = offer;
      _secondsLeft = 15;
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft > 1) {
        setState(() => _secondsLeft--);
      } else {
        _dismissOffer();
      }
    });
  }

  void _dismissOffer() {
    _countdownTimer?.cancel();
    setState(() {
      _currentOffer = null;
    });
  }

  void _acceptOffer(RideOffer offer) {
    _countdownTimer?.cancel();
    CaptainSocketService.acceptOffer(offer.rideId);

    final activeTrip = ActiveTrip(
      rideId: offer.rideId,
      customerName: 'Rahul Kumar',
      customerPhone: '+91 98765 43210',
      pickupAddress: offer.pickupAddress,
      dropAddress: offer.dropAddress,
      fare: offer.captainEarning / 0.8,
      status: 'ASSIGNED',
    );

    setState(() {
      _currentOffer = null;
    });

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ActiveTripScreen(trip: activeTrip)),
    );
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  Widget _buildVehChoiceChip(String type, String label, IconData icon, String model, String plate) {
    final isSelected = _selectedVehicleType == type;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedVehicleType = type;
          _vehicleName = model;
          _plateNumber = plate;
          _vehicleIcon = icon;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF006FD4) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? const Color(0xFF006FD4) : const Color(0xFFCBD5E1)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSelected ? Colors.white : Colors.black87),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF006FD4), width: 1.2),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.two_wheeler, color: Color(0xFFFF8100), size: 16),
                  SizedBox(width: 4),
                  Text(
                    'HOLI',
                    style: TextStyle(color: Color(0xFF042045), fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.8),
                  ),
                  Text(
                    'DO ',
                    style: TextStyle(color: Color(0xFF006FD4), fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.8),
                  ),
                  Text(
                    'CAPTAIN',
                    style: TextStyle(color: Color(0xFFFF8100), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              _isOnline ? 'ONLINE' : 'OFFLINE',
              style: TextStyle(
                color: _isOnline ? const Color(0xFF059669) : Colors.grey,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
        actions: [
          Transform.scale(
            scale: 0.8,
            child: Switch(
              value: _isOnline,
              activeColor: const Color(0xFFFF8100),
              onChanged: (val) {
                setState(() => _isOnline = val);
                CaptainSocketService.toggleOnline(val);
              },
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Captain Quick Profile Card with Vehicle Switcher
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 26,
                              backgroundColor: const Color(0xFF006FD4),
                              child: Icon(_vehicleIcon, color: Colors.white, size: 28),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Rahul Sharma', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Text('$_vehicleName • $_plateNumber', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF10B981)),
                              ),
                              child: Row(
                                children: const [
                                  Icon(Icons.star, color: Colors.amber, size: 15),
                                  SizedBox(width: 3),
                                  Text('4.88', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF059669))),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Divider(),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('REGISTERED VEHICLE:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                            Row(
                              children: [
                                _buildVehChoiceChip('BIKE', 'Bike Taxi', Icons.two_wheeler, 'Hero Splendor', 'DL 01 AB 4592'),
                                const SizedBox(width: 6),
                                _buildVehChoiceChip('AUTO', 'Auto', Icons.airport_shuttle, 'Bajaj RE Auto', 'DL 1R B 7821'),
                                const SizedBox(width: 6),
                                _buildVehChoiceChip('CAR', 'Cab / Car', Icons.directions_car, 'Maruti Dzire AC', 'DL 02 C 6190'),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Earnings & Trips Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1F1F1F), Color(0xFF2C2C2C)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 8, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'TODAY\'S EARNINGS',
                        style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '₹${_todayEarnings.toInt()}',
                            style: const TextStyle(color: Color(0xFFFFC107), fontSize: 32, fontWeight: FontWeight.w900),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white12,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '$_completedTrips Rides Completed',
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Colors.white24),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('Weekly Target Bonus', style: TextStyle(color: Colors.white70, fontSize: 13)),
                          Text('₹500 for 25 trips (14 left)', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Quick Simulator Trigger Button for immediate testing
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.black12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Developer & Testing Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 6),
                      const Text(
                        'Simulate an incoming Bike Taxi or Parcel request to test the countdown acceptance dialog.',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFFC107),
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          _showIncomingOffer(RideOffer(
                            rideId: 'test-ride-99',
                            serviceType: 'BIKE_TAXI',
                            pickupAddress: 'Sector 18 Metro Station, Noida',
                            dropAddress: 'DLF Mall of India',
                            distanceKm: 2.8,
                            etaMin: 7,
                            captainEarning: 48.0,
                            pickupDistanceKm: 0.6,
                          ));
                        },
                        icon: const Icon(Icons.flash_on),
                        label: const Text('Simulate Incoming Ride Alert', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Incoming Ride Offer Overlay with 15-second radial timer
          if (_currentOffer != null)
            Container(
              color: Colors.black.withOpacity(0.75),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 10,
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Timer circle
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 56,
                                height: 56,
                                child: CircularProgressIndicator(
                                  value: _secondsLeft / 15.0,
                                  strokeWidth: 5,
                                  valueColor: const AlwaysStoppedAnimation(Color(0xFF38BDF8)),
                                  backgroundColor: Colors.white12,
                                ),
                              ),
                              Text(
                                '$_secondsLeft',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              _currentOffer!.serviceType == 'BIKE_TAXI' ? 'BIKE TAXI REQUEST' : 'PARCEL COURIER',
                              style: const TextStyle(color: Color(0xFFFFC107), fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Earn ₹${_currentOffer!.captainEarning.toInt()}',
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.green),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${_currentOffer!.pickupDistanceKm} km away from pickup',
                            style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 16),
                          const Divider(),
                          ListTile(
                            dense: true,
                            leading: const Icon(Icons.my_location, color: Colors.green),
                            title: Text(_currentOffer!.pickupAddress, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: const Text('Pickup'),
                          ),
                          ListTile(
                            dense: true,
                            leading: const Icon(Icons.location_on, color: Colors.red),
                            title: Text(_currentOffer!.dropAddress, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: const Text('Dropoff'),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  onPressed: _dismissOffer,
                                  child: const Text('PASS', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                flex: 2,
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFFFC107),
                                    foregroundColor: Colors.black,
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  onPressed: () => _acceptOffer(_currentOffer!),
                                  child: const Text('ACCEPT RIDE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
