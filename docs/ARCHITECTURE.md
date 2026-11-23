# Holido - Bike Taxi & Parcel Delivery Platform
## System Architecture & Technical Specifications

Holido is an on-demand, high-concurrency mobility platform modeled on Rapido's core services: **Bike Taxi** and **Hyperlocal Parcel Delivery**.

---

## 1. High-Level Ecosystem

```
+-------------------------------------------------------------+
|                     HOLIDO ECOSYSTEM                        |
+-------------------------------------------------------------+
|                                                             |
|   +-----------------------+       +---------------------+   |
|   |  Customer Mobile App  |       | Captain Mobile App  |   |
|   |   (Flutter - iOS/And) |       | (Flutter - iOS/And) |   |
|   +-----------+-----------+       +----------+----------+   |
|               |                              |              |
|               |  HTTPS / WSS (Socket.io)     |              |
|               +--------------+---------------+              |
|                              |                              |
|                              v                              |
|              +-------------------------------+              |
|              |     API Gateway / LB          |              |
|              +---------------+---------------+              |
|                              |                              |
|                              v                              |
|              +-------------------------------+              |
|              |      Holido Backend Core      |              |
|              |   (NestJS / TypeScript)       |              |
|              +---+---------------+-------+---+              |
|                  |               |       |                  |
|        +---------+               |       +----------+       |
|        v                         v                  v       |
|  +-----------+             +-----------+      +-----------+ |
|  | PostgreSQL|             | Redis Geo |      | FCM Push  | |
|  |  (Prisma) |             | & PubSub  |      |  Service  | |
|  +-----------+             +-----------+      +-----------+ |
|                                                             |
+-------------------------------------------------------------+
```

---

## 2. Core Modules & Services

### A. Holido Bike Taxi
- Fast, affordable two-wheeler transit.
- Helmet safety prompt & live GPS route tracking.
- Secure 4-digit ride start OTP provided to customer, verified by Captain.
- Dynamic route re-calculation & estimated time of arrival (ETA).

### B. Holido Parcel (Courier Delivery)
- Instant point-to-point courier up to 5kg (documents, food, clothes, forgotten keys, small items).
- Dual OTP system:
  - **Pickup OTP**: Sender confirms package handover to Captain.
  - **Delivery OTP**: Recipient confirms package safe reception.
- Sender & Recipient live contact mask and instructions (e.g., "Hand over to guard").

---

## 3. Real-Time State Machines

### Ride Taxi Lifecycle
```
[CUSTOMER SEARCH]
       │
       ▼
[SEARCHING_CAPTAIN] ──(No Captain in 45s)──> [NO_CAPTAIN_FOUND]
       │
       ▼ (Captain Accepts)
[CAPTAIN_ACCEPTED] 
       │
       ▼ (Captain reaches pickup point)
[CAPTAIN_ARRIVED]
       │
       ▼ (Captain inputs Customer 4-digit OTP)
[TRIP_IN_PROGRESS]
       │
       ▼ (Captain arrives at drop point & marks finished)
[PAYMENT_PENDING / CASH_COLLECTION]
       │
       ▼
[TRIP_COMPLETED]
```

### Parcel Delivery Lifecycle
```
[PARCEL_REQUESTED]
       │
       ▼
[CAPTAIN_ACCEPTED]
       │
       ▼
[ARRIVED_AT_SENDER] ──(Verified Pickup OTP)──> [PARCEL_PICKED_UP]
                                                      │
                                                      ▼
[ARRIVED_AT_RECEIVER] ──(Verified Delivery OTP)─> [PARCEL_DELIVERED]
```

---

## 4. Pricing & Fare Calculation Engine

Formula:
```
Total Fare = (Base Fare + (Distance in KM * Per KM Rate) + (Time in Min * Time Rate)) * Surge Multiplier + Platform Fee + Taxes (GST)
```

| Component | Bike Taxi | Parcel Delivery (<= 2kg) | Parcel Delivery (2-5kg) |
|---|---|---|---|
| **Base Fare** (Includes first 1.5 km) | ₹25.00 | ₹35.00 | ₹50.00 |
| **Per KM Rate** (After 1.5 km) | ₹10.00/km | ₹12.00/km | ₹14.00/km |
| **Time Rate** (After first 10 min) | ₹1.00/min | ₹1.00/min | ₹1.00/min |
| **Platform Fee** | ₹3.00 | ₹4.00 | ₹5.00 |
| **Captain Commission** | 80% to Captain | 82% to Captain | 82% to Captain |
| **Holido Commission** | 20% Platform margin | 18% Platform margin | 18% Platform margin |

---

## 5. Geospatial Dispatch Logic
1. Captain sends GPS heartbeat (`latitude`, `longitude`, `bearing`, `speed`) every 4 seconds via WebSocket.
2. Captains stored in Redis Geospatial Index (`GEOADD active_captains <lon> <lat> <captainId>`).
3. When customer requests a ride:
   - Backend queries `GEORADIUS active_captains <customer_lon> <customer_lat> 3 km WITHDIST`.
   - Filters captains who are `ONLINE` and `AVAILABLE` (not on active trip).
   - Sorts by proximity and sends socket event `NEW_RIDE_OFFER` with 15-second countdown timer.
   - Atomic lock via Redis prevents race conditions (first captain to accept claims the ride).
