#!/usr/bin/env python3
"""
Holido Interactive Live Simulator & Mock Dispatch Server
Runs with Python standard library - zero external dependencies required!
"""

import http.server
import socketserver
import json
import os
import math
import random
import time
from urllib.parse import urlparse, parse_qs, unquote

PORT = 8080
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), 'public')
ADMIN_DIR = os.path.join(ROOT_DIR, 'admin')
ASSETS_DIR = os.path.join(ROOT_DIR, 'assets')

# In-memory database of active captains, rides, and parcels
CAPTAINS = [
    {
        "id": "cap-101",
        "name": "Rahul Sharma",
        "phone": "+91 98765 43210",
        "rating": 4.88,
        "vehicleModel": "Hero Splendor Plus (Black)",
        "vehicleNumber": "DL 01 AB 4592",
        "lat": 28.6139,
        "lng": 77.2090,
        "isOnline": True,
        "isBusy": False,
        "todayEarnings": 840,
        "totalTrips": 14
    },
    {
        "id": "cap-102",
        "name": "Amit Kumar",
        "phone": "+91 98111 22334",
        "rating": 4.92,
        "vehicleModel": "Honda Activa 6G (Grey)",
        "vehicleNumber": "DL 04 CZ 8812",
        "lat": 28.6160,
        "lng": 77.2120,
        "isOnline": True,
        "isBusy": False,
        "todayEarnings": 620,
        "totalTrips": 9
    },
    {
        "id": "cap-103",
        "name": "Vikram Singh",
        "phone": "+91 97222 33445",
        "rating": 4.75,
        "vehicleModel": "Bajaj Pulsar 150 (Blue)",
        "vehicleNumber": "DL 03 BK 1109",
        "lat": 28.6110,
        "lng": 77.2070,
        "isOnline": True,
        "isBusy": False,
        "todayEarnings": 1150,
        "totalTrips": 18
    }
]

ACTIVE_RIDES = {}

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(max(0.5, R * c * 1.25), 1)

def calculate_fare(distance_km, service_type='BIKE_TAXI', weight='UP_TO_20KG', custom_kg=50):
    if service_type == 'PARCEL_DELIVERY':
        if weight == 'CUSTOM_50_PLUS':
            base = 120.0 + max(0, custom_kg - 50) * 2.0
            per_km = 20.0
            platform = 6.0
        elif weight in ('20_TO_50KG', 'TWO_TO_FIVE_KG'):
            base = 75.0
            per_km = 16.0
            platform = 5.0
        else: # UP_TO_20KG or UP_TO_2KG
            base = 45.0
            per_km = 12.0
            platform = 4.0
    else:
        base = 25.0
        per_km = 10.0
        platform = 3.0

    chargeable_dist = max(0.0, distance_km - 1.5)
    dist_fare = round(chargeable_dist * per_km)
    subtotal = base + dist_fare
    tax = round((subtotal + platform) * 0.05)
    total = round(subtotal + platform + tax)
    est_time = max(5, int((distance_km / 24.0) * 60) + 3)

    return {
        "serviceType": service_type,
        "baseFare": base,
        "distanceFare": dist_fare,
        "platformFee": platform,
        "tax": tax,
        "totalFare": total,
        "distanceKm": distance_km,
        "estimatedTimeMin": est_time
    }

class HolidoRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def translate_path(self, path):
        parsed = urlparse(path)
        url_path = unquote(parsed.path)

        if url_path in ('/', ''):
            return os.path.join(PUBLIC_DIR, 'index.html')
        elif url_path in ('/admin', '/admin/'):
            return os.path.join(ADMIN_DIR, 'index.html')
        elif url_path.startswith('/admin/'):
            rel = url_path[len('/admin/'):].replace('/', os.sep)
            return os.path.join(ADMIN_DIR, rel)
        elif url_path.startswith('/assets/'):
            rel = url_path[len('/assets/'):].replace('/', os.sep)
            return os.path.join(ASSETS_DIR, rel)
        elif url_path.startswith('/simulator/public/'):
            rel = url_path[len('/simulator/public/'):].replace('/', os.sep)
            return os.path.join(PUBLIC_DIR, rel)
        else:
            rel = url_path.lstrip('/').replace('/', os.sep)
            cand = os.path.join(PUBLIC_DIR, rel)
            if os.path.exists(cand):
                return cand
            cand2 = os.path.join(ROOT_DIR, rel)
            if os.path.exists(cand2):
                return cand2
            return cand

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/health':
            self._send_json({"status": "OK", "service": "Holido Live Simulator", "captains": len(CAPTAINS)})
        elif path == '/api/captains':
            self._send_json(CAPTAINS)
        elif path == '/api/rides':
            self._send_json(list(ACTIVE_RIDES.values()))
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = {}
        if length > 0:
            body = json.loads(self.rfile.read(length).decode('utf-8'))

        if path == '/api/pricing/estimate':
            p = body.get('pickup', {'latitude': 28.6139, 'longitude': 77.2090})
            d = body.get('drop', {'latitude': 28.6304, 'longitude': 77.2177})
            service = body.get('serviceType', 'BIKE_TAXI')
            weight = body.get('weightCategory', 'UP_TO_2KG')
            dist = calculate_distance(p['latitude'], p['longitude'], d['latitude'], d['longitude'])
            fare = calculate_fare(dist, service, weight)
            self._send_json(fare)

        elif path == '/api/rides/request':
            ride_id = f"ride-{random.randint(1000, 9999)}"
            p = body.get('pickup', {'latitude': 28.6139, 'longitude': 77.2090, 'address': 'India Gate'})
            d = body.get('drop', {'latitude': 28.6304, 'longitude': 77.2177, 'address': 'Connaught Place'})
            service = body.get('serviceType', 'BIKE_TAXI')
            weight = body.get('weightCategory', 'UP_TO_2KG')
            dist = calculate_distance(p['latitude'], p['longitude'], d['latitude'], d['longitude'])
            fare = calculate_fare(dist, service, weight)
            otp = f"{random.randint(1000, 9999)}"

            ride = {
                "id": ride_id,
                "serviceType": service,
                "pickup": p,
                "drop": d,
                "fare": fare,
                "status": "SEARCHING_CAPTAIN",
                "startOtp": otp,
                "createdAt": time.time()
            }
            ACTIVE_RIDES[ride_id] = ride
            self._send_json(ride, status=201)

        elif path == '/api/rides/accept':
            ride_id = body.get('rideId')
            captain_id = body.get('captainId', 'cap-101')
            if ride_id in ACTIVE_RIDES:
                captain = next((c for c in CAPTAINS if c['id'] == captain_id), CAPTAINS[0])
                ACTIVE_RIDES[ride_id]['status'] = 'CAPTAIN_ASSIGNED'
                ACTIVE_RIDES[ride_id]['captain'] = captain
                captain['isBusy'] = True
                self._send_json(ACTIVE_RIDES[ride_id])
            else:
                self._send_json({"error": "Ride not found"}, status=404)

        elif path == '/api/rides/verify_otp':
            ride_id = body.get('rideId')
            otp = body.get('otp')
            if ride_id in ACTIVE_RIDES:
                if ACTIVE_RIDES[ride_id]['startOtp'] == otp:
                    ACTIVE_RIDES[ride_id]['status'] = 'IN_PROGRESS'
                    self._send_json({"success": True, "ride": ACTIVE_RIDES[ride_id]})
                else:
                    self._send_json({"success": False, "error": "Incorrect OTP"}, status=400)
            else:
                self._send_json({"error": "Ride not found"}, status=404)

        elif path == '/api/rides/complete':
            ride_id = body.get('rideId')
            if ride_id in ACTIVE_RIDES:
                ride = ACTIVE_RIDES[ride_id]
                ride['status'] = 'COMPLETED'
                earning = round(ride['fare']['totalFare'] * 0.8)
                if 'captain' in ride:
                    ride['captain']['todayEarnings'] += earning
                    ride['captain']['isBusy'] = False
                self._send_json({"success": True, "ride": ride, "captainEarning": earning})
            else:
                self._send_json({"error": "Ride not found"}, status=404)
        else:
            self._send_json({"error": "Endpoint not found"}, status=404)

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 HOLIDO - Bike Taxi & Parcel Delivery Interactive Simulator")
    print(f"📍 Local Server: http://127.0.0.1:{PORT}")
    print("=" * 60)
    with ReusableTCPServer(("127.0.0.1", PORT), HolidoRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down simulator server.")
