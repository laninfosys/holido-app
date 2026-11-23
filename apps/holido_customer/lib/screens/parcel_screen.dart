import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class ParcelScreen extends StatefulWidget {
  const ParcelScreen({Key? key}) : super(key: key);

  @override
  State<ParcelScreen> createState() => _ParcelScreenState();
}

class _ParcelScreenState extends State<ParcelScreen> {
  String _selectedCategory = 'DOCUMENTS';
  String _selectedWeight = 'UP_TO_2KG';

  final TextEditingController _receiverName = TextEditingController(text: 'Rahul Verma');
  final TextEditingController _receiverPhone = TextEditingController(text: '+91 98765 00000');
  final TextEditingController _packageNotes = TextEditingController(text: 'Fragile documents envelope');

  FareEstimate? _parcelFare;
  bool _isLoading = false;

  final Coordinates _pickup = Coordinates(
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Connaught Place, New Delhi',
  );

  final Coordinates _drop = Coordinates(
    latitude: 28.5355,
    longitude: 77.3910,
    address: 'Sector 62, Noida',
  );

  @override
  void initState() {
    super.initState();
    _fetchParcelFare();
  }

  void _fetchParcelFare() async {
    setState(() => _isLoading = true);
    final fare = await ApiService.getFareEstimate(
      _pickup,
      _drop,
      'PARCEL_DELIVERY',
      weightCategory: _selectedWeight,
    );
    setState(() {
      _parcelFare = fare;
      _isLoading = false;
    });
  }

  void _sendParcel() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Holido Parcel Confirmed! 📦'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('A Holido Captain is being dispatched to pick up your package.'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF9E6),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Pickup OTP (Share with Captain at pickup): 5821', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text('Delivery OTP (Receiver will give to Captain): 9142', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFFC107)),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Back to Home', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F2C59),
        elevation: 0,
        title: const Text('Holido Parcel Express', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Info
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.black12),
              ),
              child: Row(
                children: const [
                  Icon(Icons.inventory_2_outlined, size: 36, color: Color(0xFFFFB300)),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Fast door-to-door package delivery on two-wheelers. Documents, boxes, food & more.',
                      style: TextStyle(fontSize: 13, color: Colors.black87),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Package Category Picker
            const Text('Package Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _buildCategoryChip('DOCUMENTS', 'Documents / Files', Icons.description),
                _buildCategoryChip('FOOD', 'Food / Groceries', Icons.fastfood),
                _buildCategoryChip('CLOTHES', 'Clothes / Laundry', Icons.checkroom),
                _buildCategoryChip('BOX', 'Small Box / Items', Icons.all_inbox),
              ],
            ),
            const SizedBox(height: 16),

            // Weight Category
            const Text('Weight Limit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('Up to 2 kg')),
                    selected: _selectedWeight == 'UP_TO_2KG',
                    onSelected: (val) {
                      setState(() => _selectedWeight = 'UP_TO_2KG');
                      _fetchParcelFare();
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('2 kg to 5 kg')),
                    selected: _selectedWeight == 'TWO_TO_FIVE_KG',
                    onSelected: (val) {
                      setState(() => _selectedWeight = 'TWO_TO_FIVE_KG');
                      _fetchParcelFare();
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Recipient Details Form
            const Text('Recipient Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  children: [
                    TextField(
                      controller: _receiverName,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.person_outline),
                        labelText: 'Receiver Name',
                        border: InputBorder.none,
                      ),
                    ),
                    const Divider(),
                    TextField(
                      controller: _receiverPhone,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.phone_outlined),
                        labelText: 'Receiver Mobile Number',
                        border: InputBorder.none,
                      ),
                    ),
                    const Divider(),
                    TextField(
                      controller: _packageNotes,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.notes_outlined),
                        labelText: 'Delivery Instructions (e.g. Leave with guard)',
                        border: InputBorder.none,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Fare Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.black12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Estimated Cost', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      Text(
                        '₹${_parcelFare?.totalFare.toInt() ?? 65}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: _sendParcel,
                    child: const Text('SEND PARCEL', style: TextStyle(fontWeight: FontWeight.w900)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String key, String label, IconData icon) {
    final isSelected = _selectedCategory == key;
    return ChoiceChip(
      avatar: Icon(icon, size: 18, color: isSelected ? Colors.white : Colors.black87),
      label: Text(label),
      selected: isSelected,
      selectedColor: Colors.black,
      labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87, fontWeight: FontWeight.bold),
      onSelected: (val) {
        setState(() => _selectedCategory = key);
      },
    );
  }
}
