import 'package:flutter/material.dart';
import 'screens/captain_dashboard.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const HolidoCaptainApp());
}

class HolidoCaptainApp extends StatelessWidget {
  const HolidoCaptainApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Holido Captain - Driver Partner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF006FD4), // Royal Speed Blue
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF006FD4),
          primary: const Color(0xFF006FD4),
          secondary: const Color(0xFFFF8100), // Highway Orange
        ),
        fontFamily: 'Roboto',
      ),
      home: const CaptainDashboard(),
    );
  }
}
