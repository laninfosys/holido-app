# 🏍️ Holido - Bike Taxi & Hyperlocal Parcel Delivery Platform

> **Holido** is a high-concurrency, real-time on-demand mobility platform inspired by **Rapido**, specializing in **Bike Taxi rides** and **Hyperlocal Parcel Delivery**.

---

## 🌟 Ecosystem Overview

The Holido codebase is organized into four core pillars:

```
d:\Holido App\
├── docs\
│   └── ARCHITECTURE.md          # Complete technical specifications & state machines
├── backend\                    # Real-time Dispatch & Fare Calculation Server
│   ├── package.json
│   ├── tsconfig.json
│   └── src\
│       ├── types\               # Shared interfaces (Rides, Parcels, Captains)
│       ├── services\
│       │   ├── geo.service.ts       # Haversine distance & route interpolation
│       │   ├── pricing.service.ts   # Dynamic fare calculation (Base + KM + Surge + Tax)
│       │   ├── captain.service.ts   # Captain states, GPS tracking & radius matching
│       │   ├── ride.service.ts      # Ride lifecycle & 4-digit OTP verification
│       │   ├── parcel.service.ts    # Dual OTP parcel courier (Pickup OTP + Delivery OTP)
│       │   └── simulator.service.ts # Autonomous bot captains for local testing
│       ├── gateways\
│       │   └── socket.gateway.ts    # Socket.io real-time bidirectional event engine
│       └── main.ts                  # REST API + Socket.io server bootstrap
├── apps\
│   ├── holido_customer\        # Customer Mobile App (Flutter)
│   │   ├── pubspec.yaml
│   │   └── lib\
│   │       ├── models\
│   │       ├── services\
│   │       ├── screens\
│   │       │   ├── home_screen.dart           # Bike vs Parcel selector & booking
│   │       │   ├── live_tracking_screen.dart  # Live GPS tracking, OTP badge, SOS
│   │       │   └── parcel_screen.dart         # Package details, weights, receiver info
│   │       └── main.dart
│   └── holido_captain\         # Captain / Driver Partner Mobile App (Flutter)
│       ├── pubspec.yaml
│       └── lib\
│           ├── models\
│           ├── services\
│           ├── screens\
│           │   ├── captain_dashboard.dart     # Online/Offline, earnings & 15s offer alert
│           │   └── active_trip_screen.dart    # Turn-by-turn, arrive, OTP verify, complete
│           └── main.dart
└── simulator\                  # Interactive Live Simulator (Instant Zero-Install Demo)
    ├── server.py               # Lightweight Python HTTP server & mock dispatch API
    └── public\
        ├── index.html          # Dual-phone visual interface (Customer vs Captain vs GPS Map)
        ├── style.css           # Rapido-style yellow & dark charcoal theme
        └── app.js             # Canvas road map & simulated trip lifecycle
```

---

## 🚀 Instant Quickstart: Live Ecosystem Simulator

You can test and visualize the entire Holido workflow immediately in your web browser:

### Option 1: Direct Browser Launch (Recommended)
Simply open the file in your browser:
```powershell
start "d:\Holido App\simulator\public\index.html"
```

### Option 2: Run via Python Local Server
```powershell
python "d:\Holido App\simulator\server.py"
```
Then navigate to: **`http://localhost:8080`**

### What You Can Experience in the Simulator:
1. **Left Device (Customer App)**:
   - Switch between **Bike Taxi** and **Parcel Delivery**.
   - Review live fare estimation (Base fare ₹25, per-km rate, platform fee).
   - Click **`BOOK HOLIDO BIKE`** — reveals your secure 4-digit ride start OTP.
2. **Right Device (Captain App)**:
   - Toggle **Online / Offline** status.
   - Watch the incoming ride request alert modal pop up with an animated **15-second countdown timer**.
   - Click **`ACCEPT RIDE`** to claim the trip.
   - Click **`I HAVE ARRIVED AT PICKUP`** when reaching the rider.
   - Enter the customer's 4-digit OTP to verify and start the ride.
   - Click **`COMPLETE TRIP & COLLECT CASH`** — watch the Captain's daily earnings increase!
3. **Center Display (Real-Time GPS Map)**:
   - Watch the Holido bike marker move smoothly along city roads from the Captain's location to the pickup point, and then from pickup to the drop-off destination.
4. **`⚡ One-Click Auto Demonstration`**:
   - Automates the full booking, dispatch, driving, OTP verification, and trip settlement cycle.

---

## 🛠️ Setting Up Backend & Mobile Apps for Production

### 1. Holido Backend (Node.js & TypeScript)
1. Install [Node.js (v18+)](https://nodejs.org/).
2. Navigate to the backend directory and install dependencies:
   ```powershell
   cd "d:\Holido App\backend"
   npm install
   ```
3. Start the real-time dispatch server:
   ```powershell
   npm run start:dev
   ```
   *Server will run at `http://localhost:4000` with WebSocket gateway ready.*

### 2. Holido Customer Mobile App (Flutter)
1. Install [Flutter SDK](https://docs.flutter.dev/get-started/install/windows).
2. Navigate to the customer app:
   ```powershell
   cd "d:\Holido App\apps\holido_customer"
   flutter pub get
   flutter run
   ```

### 3. Holido Captain Mobile App (Flutter)
1. Navigate to the captain app:
   ```powershell
   cd "d:\Holido App\apps\holido_captain"
   flutter pub get
   flutter run
   ```

---

## 💡 Core Features & Business Logic Implemented

| Feature | Description |
|---|---|
| **Bike Taxi Engine** | Ultra-fast two-wheeler transit booking, beat city traffic. |
| **Parcel Delivery** | Hyperlocal point-to-point courier (documents, packages up to 5kg). |
| **Dynamic Fare Model** | Base fare + Distance rate + Time rate + Surge multiplier + Platform fee + GST. |
| **Security & Safety** | 4-Digit OTP ride verification, Dual OTP for parcels (pickup + delivery), SOS button. |
| **Geospatial Dispatch** | Proximity search (3-5km radius), nearest available captain matching with Redis Geo schema. |
| **Captain Economics** | 80% earnings to Captain, 20% platform commission, daily incentives and targets. |
