import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'live_tracking_screen.dart';
import 'parcel_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedTab = 0; // 0: Bike Taxi, 1: Parcel Delivery
  String _selectedVehicle = 'BIKE'; // BIKE, AUTO, CAR
  final TextEditingController _destinationController =
      TextEditingController(text: 'Connaught Place, Central Delhi');

  final Coordinates _currentPickup = Coordinates(
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'India Gate, New Delhi',
  );

  final Coordinates _defaultDrop = Coordinates(
    latitude: 28.6304,
    longitude: 77.2177,
    address: 'Connaught Place, Central Delhi',
  );

  FareEstimate? _fareEstimate;
  bool _isLoadingEstimate = false;

  String _selectedPaymentMode = 'CASH'; // CASH, UPI, WALLET, ONLINE
  String _selectedPaymentName = 'Cash to Captain';
  IconData _selectedPaymentIcon = Icons.payments_outlined;

  void _showPaymentModeSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Payment Method',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                )
              ],
            ),
            const SizedBox(height: 12),
            _buildPaymentOption(
              ctx,
              id: 'CASH',
              name: 'Cash to Captain',
              subtitle: 'Pay directly after ride completion',
              icon: Icons.payments_outlined,
            ),
            _buildPaymentOption(
              ctx,
              id: 'UPI',
              name: 'UPI Instant Pay',
              subtitle: 'Google Pay, PhonePe, Paytm, BHIM',
              icon: Icons.flash_on,
            ),
            _buildPaymentOption(
              ctx,
              id: 'WALLET',
              name: 'Holido Wallet',
              subtitle: 'Balance: ₹350.00 • Instant digital debit',
              icon: Icons.account_balance_wallet_outlined,
            ),
            _buildPaymentOption(
              ctx,
              id: 'ONLINE',
              name: 'Card / NetBanking',
              subtitle: 'Secured via Razorpay Payment Gateway',
              icon: Icons.credit_card,
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption(
    BuildContext ctx, {
    required String id,
    required String name,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedPaymentMode == id;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
          width: isSelected ? 1.5 : 1,
        ),
      ),
      child: ListTile(
        leading: Icon(icon, color: isSelected ? const Color(0xFF1E3A8A) : Colors.black87),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        trailing: isSelected
            ? const Icon(Icons.check_circle, color: Color(0xFF2563EB), size: 20)
            : null,
        onTap: () {
          setState(() {
            _selectedPaymentMode = id;
            _selectedPaymentName = name;
            _selectedPaymentIcon = icon;
          });
          Navigator.pop(ctx);
        },
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    ApiService.initializeSocket();
    _loadEstimate();
  }

  void _loadEstimate() async {
    setState(() => _isLoadingEstimate = true);
    final estimate = await ApiService.getFareEstimate(
      _currentPickup,
      _defaultDrop,
      _selectedTab == 0 ? 'BIKE_TAXI' : 'PARCEL_DELIVERY',
    );
    setState(() {
      _fareEstimate = estimate;
      _isLoadingEstimate = false;
    });
  }

  void _bookRide() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF1E3A8A)),
      ),
    );

    final ride = await ApiService.requestRide(
      _currentPickup,
      _defaultDrop,
      autoSimulate: true,
    );

    Navigator.pop(context); // close loader

    if (ride != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => LiveTrackingScreen(initialRide: ride),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to book ride. Check backend server.')),
      );
    }
  }

  Widget _buildVehicleOptionCard(String type, String title, String subtitle, int basePrice, IconData icon, Color themeColor) {
    final isSelected = _selectedVehicle == type;
    final int displayPrice = type == 'CAR' ? 85 : (type == 'AUTO' ? 52 : (_fareEstimate?.totalFare.toInt() ?? 35));

    return InkWell(
      onTap: () => setState(() => _selectedVehicle = type),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF006FD4) : const Color(0xFFE2E8F0),
            width: isSelected ? 2.0 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected ? const Color(0xFF006FD4).withOpacity(0.08) : Colors.black.withOpacity(0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFDBEAFE) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: themeColor, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹$displayPrice',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                ),
                Text(
                  isSelected ? 'Selected ✔' : 'Fastest',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? const Color(0xFF006FD4) : const Color(0xFF059669),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF006FD4), width: 1.2),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x22006FD4),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  )
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.electric_bolt, color: Color(0xFFFF8100), size: 17),
                  SizedBox(width: 4),
                  Text(
                    'HOLI',
                    style: TextStyle(
                      color: Color(0xFF042045),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.0,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    'DO',
                    style: TextStyle(
                      color: Color(0xFF006FD4),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.0,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Fast & Affordable Rides',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Color(0xFF0F172A)),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.account_circle_outlined, color: Color(0xFF0F172A)),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Service Selector Switch (Bike vs Parcel)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedTab = 0);
                        _loadEstimate();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedTab == 0 ? const Color(0xFF006FD4) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _selectedTab == 0 ? const Color(0xFF006FD4) : const Color(0xFFE2E8F0),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 4,
                            )
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.two_wheeler,
                              color: _selectedTab == 0 ? Colors.white : const Color(0xFF475569),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Bike Taxi',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _selectedTab == 0 ? Colors.white : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedTab = 1);
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const ParcelScreen()),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedTab == 1 ? const Color(0xFF006FD4) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _selectedTab == 1 ? const Color(0xFF006FD4) : const Color(0xFFE2E8F0),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 4,
                            )
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.local_shipping_outlined,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Parcel Delivery',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Pickup & Drop Location Card
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Card(
                elevation: 3,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Pickup
                      Row(
                        children: [
                          const Icon(Icons.my_location, color: Colors.green, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'PICKUP LOCATION',
                                  style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  _currentPickup.address ?? 'Current Location',
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.only(left: 10),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: SizedBox(
                            height: 24,
                            child: VerticalDivider(thickness: 1.5, color: Colors.grey),
                          ),
                        ),
                      ),
                      // Drop
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.red, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'DROP DESTINATION',
                                  style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  _defaultDrop.address ?? 'Destination',
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Multi-Vehicle Selection Grid (Bike, Auto, Cab)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'CHOOSE VEHICLE',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  _buildVehicleOptionCard('BIKE', 'Holido Bike', '1 Seat • 2m away', 35, Icons.two_wheeler, const Color(0xFF006FD4)),
                  const SizedBox(height: 8),
                  _buildVehicleOptionCard('AUTO', 'Holido Auto', '3 Seats • 3m away', 52, Icons.airport_shuttle, const Color(0xFFFF8100)),
                  const SizedBox(height: 8),
                  _buildVehicleOptionCard('CAR', 'Holido Cab (AC)', '4 Seats • 4m away', 85, Icons.directions_car, const Color(0xFF059669)),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Payment Mode Selector Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: InkWell(
                onTap: _showPaymentModeSheet,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      )
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(_selectedPaymentIcon, color: const Color(0xFF1E3A8A), size: 24),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _selectedPaymentName,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              const Text(
                                'Tap to change payment method',
                                style: TextStyle(color: Colors.grey, fontSize: 11),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const Text(
                        'CHANGE ▾',
                        style: TextStyle(
                          color: Color(0xFF2563EB),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Book Now Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF8100), // Highway Orange
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 3,
                  ),
                  onPressed: _bookRide,
                  child: const Text(
                    'BOOK HOLIDO BIKE',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Safety & Promo Banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF9E6),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFFE082)),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.verified_user, color: Color(0xFFF57F17), size: 28),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        '100% Verified Captains with Sanitized Helmets & 24x7 Safety SOS.',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
