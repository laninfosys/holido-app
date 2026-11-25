// Holido Interactive Ecosystem Simulator Script

// ================= GLOBAL PRICING & VEHICLE REGISTRY =================
const DEFAULT_PRICING_CONFIG = {
  platformFee: 3.00,
  activeSurgeMultiplier: 1.0,
  selectedGeoZone: 'H3-DL01',
  geoHexZones: [
    { id: 'H3-DL01', name: 'Connaught Place & Central Hub', multiplier: 1.5, status: 'PEAK' },
    { id: 'H3-DL02', name: 'Cyber City & DLF Hub, Gurugram', multiplier: 1.8, status: 'PEAK' },
    { id: 'H3-DL03', name: 'IGI Airport & Aerocity T3', multiplier: 1.4, status: 'HIGH' },
    { id: 'H3-DL04', name: 'Noida Sector 62 & Tech Park', multiplier: 1.2, status: 'MODERATE' },
    { id: 'H3-DL05', name: 'South Extension & AIIMS', multiplier: 1.0, status: 'NORMAL' }
  ],
  paymentConvenienceFees: {
    CASH: 0.00,
    UPI: 0.00,
    WALLET: 0.00,
    DEBIT_CARD: 3.00,
    CREDIT_CARD: 8.00,
    NETBANKING: 5.00
  }
};

function getPricingConfig() {
  try {
    const raw = localStorage.getItem('holido_pricing_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PRICING_CONFIG,
        ...parsed,
        paymentConvenienceFees: {
          ...DEFAULT_PRICING_CONFIG.paymentConvenienceFees,
          ...(parsed.paymentConvenienceFees || {})
        }
      };
    }
  } catch (e) {
    console.warn('Error reading holido_pricing_config from storage:', e);
  }
  return DEFAULT_PRICING_CONFIG;
}

const VEHICLE_DATA = {
  BIKE: {
    name: 'Holido Bike',
    icon: '🏍️',
    badgeText: 'BIKE TAXI REQUEST',
    baseFare: 25.0,
    perKmRate: 10.0,
    seats: 1,
    eta: '2m',
    model: 'Hero Splendor Plus',
    plate: 'DL 01 AB 4592',
    desc: 'Fastest way through city traffic • 1 Seat',
    safetyBadge: '🛡️ Sanitized Helmet Provided & Passenger Insured'
  },
  AUTO: {
    name: 'Holido Auto',
    icon: '🛺',
    badgeText: 'AUTO RICKSHAW REQUEST',
    baseFare: 35.0,
    perKmRate: 14.0,
    seats: 3,
    eta: '3m',
    model: 'Bajaj RE Compact',
    plate: 'DL 1R B 7821',
    desc: 'Spacious & pocket-friendly • 3 Seats',
    safetyBadge: '🛡️ Meter-free upfront pricing & Insured Ride'
  },
  CAR: {
    name: 'Holido Cab (AC)',
    icon: '🚗',
    badgeText: 'CAB / CAR REQUEST',
    baseFare: 60.0,
    perKmRate: 18.0,
    seats: 4,
    eta: '4m',
    model: 'Maruti Suzuki Dzire AC',
    plate: 'DL 02 C 6190',
    desc: 'Air conditioned comfort & trunk space • 4 Seats',
    safetyBadge: '🛡️ Sanitized AC Sedan & Emergency SOS Insured'
  }
};

let selectedVehicleType = 'BIKE';
let captainRegisteredVehicle = 'BIKE';

let currentService = 'BIKE_TAXI';
let activeRide = null;
let countdownInterval = null;
let bikeAnimationId = null;

// Map Coordinates (Pixel based for 520x580 canvas) - Ahmedabad Pilot Hub
let PICKUP_POS = { x: 130, y: 440, label: 'SG Highway, Ahmedabad' };
let DROP_POS = { x: 390, y: 140, label: 'Vastrapur Lake, Ahmedabad' };
let currentPickupCoords = { lat: 23.0338, lon: 72.5085, name: 'SG Highway, Ahmedabad, Gujarat' };
let currentDropCoords = { lat: 23.0375, lon: 72.5310, name: 'Vastrapur Lake, Ahmedabad, Gujarat' };
let currentTripDistanceKm = 4.8;
let currentTripDurationMin = 12;

let captainPos = { x: 90, y: 520, angle: 0 };
let currentTarget = null;
let animationProgress = 0;
let animationPath = [];

// Initialize Canvas
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

function initMap() {
  drawMap();
  drawCustMiniMap();
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background map grid
  ctx.fillStyle = '#141821';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Roads
  ctx.strokeStyle = '#222838';
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Major Road 1 (Radial)
  ctx.beginPath();
  ctx.moveTo(70, 530);
  ctx.lineTo(130, 440);
  ctx.lineTo(260, 320);
  ctx.lineTo(390, 140);
  ctx.lineTo(460, 80);
  ctx.stroke();

  // Cross roads
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(40, 360);
  ctx.lineTo(480, 410);
  ctx.moveTo(80, 200);
  ctx.lineTo(460, 240);
  ctx.stroke();

  // Active Trip Route Line (Highway Orange dashed road - matches Holido logo road!)
  if (activeRide) {
    ctx.strokeStyle = 'rgba(255, 129, 0, 0.9)';
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(PICKUP_POS.x, PICKUP_POS.y);
    ctx.lineTo(260, 320);
    ctx.lineTo(DROP_POS.x, DROP_POS.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw Pickup Pin
  drawPin(PICKUP_POS.x, PICKUP_POS.y, '#00C853', 'P');

  // Draw Drop Pin
  drawPin(DROP_POS.x, DROP_POS.y, '#D50000', 'D');

  // Draw Moving Holido Captain Bike
  drawBike(captainPos.x, captainPos.y);

  // Labels (Ahmedabad Service Zone)
  ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = '#AAA';
  ctx.fillText('SG Highway (Pickup)', PICKUP_POS.x - 45, PICKUP_POS.y + 24);
  ctx.fillText('Vastrapur Lake (Drop)', DROP_POS.x - 55, DROP_POS.y - 14);
}

function drawPin(x, y, color, text) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawBike(x, y) {
  const currentVeh = VEHICLE_DATA[captainRegisteredVehicle] || VEHICLE_DATA.BIKE;
  ctx.save();
  // Glowing pulse ring (Highway Orange Glow)
  ctx.fillStyle = 'rgba(255, 129, 0, 0.28)';
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();

  // Vehicle icon circle (Holido Royal Blue with Orange Ring)
  ctx.fillStyle = '#006FD4';
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FF8100';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Dynamic Vehicle Icon (Bike, Auto, Car)
  ctx.font = '12px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(currentVeh.icon, x, y);

  // Captain label tag
  ctx.fillStyle = 'rgba(4, 27, 59, 0.9)';
  ctx.fillRect(x - 44, y - 28, 88, 16);
  ctx.strokeStyle = '#006FD4';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 44, y - 28, 88, 16);
  ctx.fillStyle = '#FF8100';
  ctx.font = 'bold 8.5px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`Rahul (${currentVeh.name})`, x, y - 19);

  ctx.restore();
}

// ================= IN-APP CUSTOMER MINI MAP & RADAR =================
const custCanvas = document.getElementById('custMiniMapCanvas');
const custCtx = custCanvas ? custCanvas.getContext('2d') : null;

let miniMapTick = 0;
let radarPulseRadius = 0;

const NEARBY_CAPTAINS = [
  { id: 'CAP-101', name: 'Rahul', type: 'BIKE', vehicle: 'Hero Splendor', dist: '0.4 km', eta: '2m', baseOffset: { x: -50, y: 38 } },
  { id: 'CAP-102', name: 'Amit', type: 'AUTO', vehicle: 'Bajaj RE Auto', dist: '0.7 km', eta: '3m', baseOffset: { x: 62, y: -28 } },
  { id: 'CAP-103', name: 'Vikram', type: 'CAR', vehicle: 'Maruti Dzire AC', dist: '1.1 km', eta: '4m', baseOffset: { x: -68, y: -36 } }
];

function drawCustMiniMap() {
  if (!custCtx || !custCanvas) return;

  custCtx.clearRect(0, 0, custCanvas.width, custCanvas.height);
  miniMapTick++;

  const w = custCanvas.width;
  const h = custCanvas.height;
  const cx = w / 2;
  const cy = h / 2 - 6;

  // Background Map (Clean light road map)
  custCtx.fillStyle = '#F1F5F9';
  custCtx.fillRect(0, 0, w, h);

  // Roads Grid
  custCtx.strokeStyle = '#FFFFFF';
  custCtx.lineWidth = 18;
  custCtx.lineCap = 'round';
  custCtx.beginPath();
  custCtx.moveTo(20, 160);
  custCtx.lineTo(cx, cy);
  custCtx.lineTo(w - 20, 20);
  custCtx.stroke();

  custCtx.lineWidth = 10;
  custCtx.beginPath();
  custCtx.moveTo(20, 50);
  custCtx.lineTo(w - 20, 130);
  custCtx.stroke();

  // Concentric Distance Guide Rings
  custCtx.strokeStyle = 'rgba(0, 111, 212, 0.2)';
  custCtx.lineWidth = 1;
  custCtx.setLineDash([4, 4]);

  custCtx.beginPath();
  custCtx.arc(cx, cy, 38, 0, Math.PI * 2);
  custCtx.stroke();

  custCtx.beginPath();
  custCtx.arc(cx, cy, 72, 0, Math.PI * 2);
  custCtx.stroke();
  custCtx.setLineDash([]);

  // Distance labels
  custCtx.fillStyle = '#94A3B8';
  custCtx.font = '8px Plus Jakarta Sans, sans-serif';
  custCtx.fillText('0.5 km', cx + 40, cy - 4);
  custCtx.fillText('1.0 km', cx + 74, cy - 4);

  // Pulsing Live Radar Rings (Searching effect - Brand Royal Blue)
  radarPulseRadius = (radarPulseRadius + 0.6) % 76;
  const alpha1 = Math.max(0, 1 - (radarPulseRadius / 76));
  custCtx.strokeStyle = `rgba(0, 111, 212, ${alpha1 * 0.85})`;
  custCtx.lineWidth = 1.8;
  custCtx.beginPath();
  custCtx.arc(cx, cy, radarPulseRadius, 0, Math.PI * 2);
  custCtx.stroke();

  const r2 = (radarPulseRadius + 38) % 76;
  const alpha2 = Math.max(0, 1 - (r2 / 76));
  custCtx.strokeStyle = `rgba(0, 111, 212, ${alpha2 * 0.85})`;
  custCtx.beginPath();
  custCtx.arc(cx, cy, r2, 0, Math.PI * 2);
  custCtx.stroke();

  // Active Trip Route or Destination Pin if In Progress (Highway Orange)
  if (activeRide && (activeRide.status === 'IN_PROGRESS' || activeRide.status === 'CAPTAIN_ARRIVED')) {
    const dropX = w - 40;
    const dropY = 32;
    custCtx.strokeStyle = '#FF8100';
    custCtx.lineWidth = 3;
    custCtx.setLineDash([4, 4]);
    custCtx.beginPath();
    custCtx.moveTo(cx, cy);
    custCtx.lineTo(dropX, dropY);
    custCtx.stroke();
    custCtx.setLineDash([]);

    // Drop Pin
    custCtx.fillStyle = '#DC2626';
    custCtx.beginPath();
    custCtx.arc(dropX, dropY, 6, 0, Math.PI * 2);
    custCtx.fill();
    custCtx.fillStyle = '#FFF';
    custCtx.font = 'bold 7px sans-serif';
    custCtx.fillText('Drop', dropX - 10, dropY - 9);
  }

  // Draw Nearby Available Captains
  NEARBY_CAPTAINS.forEach((cap, idx) => {
    const isAssigned = activeRide && cap.id === 'CAP-101' && (activeRide.status === 'CAPTAIN_ASSIGNED' || activeRide.status === 'CAPTAIN_ARRIVED' || activeRide.status === 'IN_PROGRESS');
    const isOtherAndTripActive = activeRide && cap.id !== 'CAP-101' && activeRide.status !== 'SEARCHING_CAPTAIN';

    // Subtle drift motion
    const driftX = Math.sin(miniMapTick * 0.04 + idx * 2) * 2;
    const driftY = Math.cos(miniMapTick * 0.03 + idx * 2) * 1.5;

    let bx = cx + cap.baseOffset.x + driftX;
    let by = cy + cap.baseOffset.y + driftY;

    // If assigned Captain is moving towards pickup
    if (isAssigned && activeRide.status === 'CAPTAIN_ASSIGNED') {
      const approachFactor = Math.sin(miniMapTick * 0.02) * 0.5 + 0.5;
      bx = cx + (cap.baseOffset.x * (1 - approachFactor * 0.7));
      by = cy + (cap.baseOffset.y * (1 - approachFactor * 0.7));
    } else if (isAssigned && activeRide.status === 'IN_PROGRESS') {
      bx = cx + 50 + Math.sin(miniMapTick * 0.03) * 15;
      by = cy - 25 + Math.cos(miniMapTick * 0.03) * 10;
    }

    custCtx.save();
    if (isOtherAndTripActive) {
      custCtx.globalAlpha = 0.25; // fade out others when matched
    }

    // Bike Beacon Ring
    if (isAssigned) {
      custCtx.strokeStyle = 'rgba(255, 129, 0, 0.6)';
      custCtx.lineWidth = 2;
      custCtx.setLineDash([3, 3]);
      custCtx.beginPath();
      custCtx.moveTo(bx, by);
      custCtx.lineTo(cx, cy);
      custCtx.stroke();
      custCtx.setLineDash([]);

      custCtx.fillStyle = 'rgba(255, 129, 0, 0.35)';
      custCtx.beginPath();
      custCtx.arc(bx, by, 12, 0, Math.PI * 2);
      custCtx.fill();
    } else {
      custCtx.fillStyle = 'rgba(0, 111, 212, 0.3)';
      custCtx.beginPath();
      custCtx.arc(bx, by, 10, 0, Math.PI * 2);
      custCtx.fill();
    }

    // Bike circle
    custCtx.fillStyle = isAssigned ? '#FF8100' : '#006FD4';
    custCtx.beginPath();
    custCtx.arc(bx, by, 7.5, 0, Math.PI * 2);
    custCtx.fill();
    custCtx.strokeStyle = isAssigned ? '#FFF' : '#38BDF8';
    custCtx.lineWidth = 1.5;
    custCtx.stroke();

    // Dynamic Vehicle Icon emoji (Bike, Auto, Car)
    const vehType = (cap.id === 'CAP-101') ? captainRegisteredVehicle : (cap.type || 'BIKE');
    const vehObj = VEHICLE_DATA[vehType] || VEHICLE_DATA.BIKE;
    custCtx.font = '8px sans-serif';
    custCtx.textAlign = 'center';
    custCtx.textBaseline = 'middle';
    custCtx.fillText(vehObj.icon, bx, by);

    // Label tag (Clean light tag)
    custCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    custCtx.fillRect(bx - 32, by + 9, 64, 12);
    custCtx.strokeStyle = isAssigned ? '#FF8100' : '#CBD5E1';
    custCtx.lineWidth = 0.8;
    custCtx.strokeRect(bx - 32, by + 9, 64, 12);

    custCtx.fillStyle = isAssigned ? '#FF8100' : '#0F172A';
    custCtx.font = 'bold 7.5px Plus Jakarta Sans, sans-serif';
    const tagText = isAssigned ? `${cap.name} (Matched)` : `${cap.name} • ${cap.dist}`;
    custCtx.fillText(tagText, bx, by + 16);

    custCtx.restore();
  });

  // User Pickup Pin at Center
  custCtx.save();
  custCtx.fillStyle = 'rgba(0, 200, 83, 0.25)';
  custCtx.beginPath();
  custCtx.arc(cx, cy, 11, 0, Math.PI * 2);
  custCtx.fill();

  custCtx.fillStyle = '#00C853';
  custCtx.beginPath();
  custCtx.arc(cx, cy, 6.5, 0, Math.PI * 2);
  custCtx.fill();
  custCtx.strokeStyle = '#FFFFFF';
  custCtx.lineWidth = 1.8;
  custCtx.stroke();

  // You (India Gate) Tag
  custCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  custCtx.fillRect(cx - 36, cy - 22, 72, 13);
  custCtx.strokeStyle = '#00C853';
  custCtx.lineWidth = 1;
  custCtx.strokeRect(cx - 36, cy - 22, 72, 13);

  custCtx.fillStyle = '#065F46';
  custCtx.font = 'bold 8px Plus Jakarta Sans, sans-serif';
  custCtx.textAlign = 'center';
  custCtx.textBaseline = 'middle';
  custCtx.fillText('📍 You (Pickup)', cx, cy - 15);
  custCtx.restore();

  requestAnimationFrame(drawCustMiniMap);
}

// Service Selection
let selectedPaymentMethod = {
  id: 'CASH',
  icon: '💵',
  name: 'Cash to Captain',
  sub: 'Pay directly after arrival at destination'
};

function togglePaymentSheet(show) {
  const drawer = document.getElementById('custPaymentDrawer');
  if (!drawer) return;
  if (show === undefined) {
    drawer.classList.toggle('hidden');
  } else if (show) {
    drawer.classList.remove('hidden');
  } else {
    drawer.classList.add('hidden');
  }
}

// RIDER VEHICLE SELECTION SWITCHER (Captain Profile)
function setCaptainVehicle(vehType) {
  captainRegisteredVehicle = vehType;
  const veh = VEHICLE_DATA[vehType] || VEHICLE_DATA.BIKE;

  // Highlight active button
  ['BIKE', 'AUTO', 'CAR'].forEach(t => {
    const btn = document.getElementById(`capVehBtn-${t}`);
    if (btn) btn.classList.toggle('active', t === vehType);
  });

  // Update strip details
  const iconEl = document.getElementById('capVehDisplayIcon');
  const modelEl = document.getElementById('capVehDisplayModel');
  const plateEl = document.getElementById('capVehDisplayPlate');
  if (iconEl) iconEl.innerText = veh.icon;
  if (modelEl) modelEl.innerText = veh.model;
  if (plateEl) plateEl.innerText = `${veh.plate} (Verified)`;

  // Update in customer tracking view if assigned
  const custCapVeh = document.getElementById('custCapVehicle');
  const custCapAvatar = document.querySelector('#custCaptainInfo .cap-avatar');
  if (custCapVeh) custCapVeh.innerText = `${veh.model} • ${veh.plate}`;
  if (custCapAvatar) custCapAvatar.innerText = veh.icon;

  drawMap();
  drawCustMiniMap();

  setToast(`Captain registered vehicle updated to: ${veh.icon} ${veh.name}`);
}

// CUSTOMER VEHICLE SELECTION (Bike, Auto, Car)
function selectVehicleType(vehType) {
  if (currentService !== 'BIKE_TAXI') {
    selectService('BIKE_TAXI');
  }
  selectedVehicleType = vehType;

  ['BIKE', 'AUTO', 'CAR'].forEach(t => {
    const card = document.getElementById(`vehCard-${t}`);
    if (card) card.classList.toggle('active', t === vehType);
  });

  updateFare();
  const veh = VEHICLE_DATA[vehType] || VEHICLE_DATA.BIKE;
  setToast(`Selected Vehicle: ${veh.icon} ${veh.name}`);
}

// PAYMENT SELECTION WITH DYNAMIC CONVENIENCE FEES
function selectCustomerPayment(id, icon, name, sub) {
  const cfg = getPricingConfig();
  const convFee = cfg.paymentConvenienceFees[id] !== undefined ? cfg.paymentConvenienceFees[id] : 0.00;

  selectedPaymentMethod = { id, icon, name, sub, convFee };

  const iconEl = document.getElementById('custPayIcon');
  const titleEl = document.getElementById('custPayTitle');
  const subEl = document.getElementById('custPaySub');

  if (iconEl) iconEl.innerText = icon;
  if (titleEl) titleEl.innerText = name;
  if (subEl) {
    const feeText = convFee > 0 ? `• +₹${convFee.toFixed(2)} convenience fee` : '• ₹0 fee';
    subEl.innerText = `${sub} ${feeText}`;
  }

  ['CASH', 'UPI', 'WALLET', 'DEBIT_CARD', 'CREDIT_CARD', 'NETBANKING'].forEach(key => {
    const el = document.getElementById(`opt-${key}`);
    if (el) el.classList.toggle('active', key === id);
  });

  togglePaymentSheet(false);
  updateFare();
  setToast(`Payment method set to: ${name}${convFee > 0 ? ` (+₹${convFee.toFixed(2)} fee)` : ''}`);
}

// ================= ALL-INDIA EXPANSION & GEO-FENCING CITY CHECK =================

function getAdminActiveCities() {
  try {
    const raw = localStorage.getItem('holido_city_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read city config from storage:', e);
  }
  return [
    { id: 'CITY-AMD', name: 'Ahmedabad', state: 'Gujarat', status: 'ACTIVE' },
    { id: 'CITY-SRT', name: 'Surat', state: 'Gujarat', status: 'COMING_SOON' },
    { id: 'CITY-BRD', name: 'Vadodara', state: 'Gujarat', status: 'COMING_SOON' },
    { id: 'CITY-RJK', name: 'Rajkot', state: 'Gujarat', status: 'COMING_SOON' },
    { id: 'CITY-BOM', name: 'Mumbai', state: 'Maharashtra', status: 'COMING_SOON' },
    { id: 'CITY-DEL', name: 'Delhi NCR', state: 'Delhi', status: 'COMING_SOON' },
    { id: 'CITY-BLR', name: 'Bengaluru', state: 'Karnataka', status: 'COMING_SOON' }
  ];
}

function checkServiceableLocations() {
  const pickupInput = document.getElementById('pickupAddr');
  const dropInput = document.getElementById('dropAddr');
  if (!pickupInput || !dropInput) return true;

  const pickup = pickupInput.value.trim().toLowerCase();
  const drop = dropInput.value.trim().toLowerCase();
  const combined = `${pickup} ${drop}`;

  const cities = getAdminActiveCities();
  const activeCities = cities.filter(c => c.status === 'ACTIVE');

  // List of major Indian cities for geo-fencing checks
  const knownCities = [
    { key: 'surat', name: 'Surat, Gujarat' },
    { key: 'vadodara', name: 'Vadodara, Gujarat' },
    { key: 'baroda', name: 'Vadodara, Gujarat' },
    { key: 'rajkot', name: 'Rajkot, Gujarat' },
    { key: 'mumbai', name: 'Mumbai, Maharashtra' },
    { key: 'bombay', name: 'Mumbai, Maharashtra' },
    { key: 'pune', name: 'Pune, Maharashtra' },
    { key: 'delhi', name: 'Delhi NCR' },
    { key: 'noida', name: 'Noida, NCR' },
    { key: 'gurgaon', name: 'Gurugram, NCR' },
    { key: 'bengaluru', name: 'Bengaluru, Karnataka' },
    { key: 'bangalore', name: 'Bengaluru, Karnataka' },
    { key: 'jaipur', name: 'Jaipur, Rajasthan' },
    { key: 'kolkata', name: 'Kolkata, West Bengal' },
    { key: 'hyderabad', name: 'Hyderabad, Telangana' },
    { key: 'chennai', name: 'Chennai, Tamil Nadu' }
  ];

  let detectedUnserved = null;
  for (const kc of knownCities) {
    if (combined.includes(kc.key)) {
      // Is this city currently ACTIVE in admin config?
      const isActive = activeCities.some(ac => ac.name.toLowerCase().includes(kc.key));
      if (!isActive) {
        detectedUnserved = kc.name;
        break;
      }
    }
  }

  // Check if location matches ANY active city (e.g. Ahmedabad)
  const matchesAnyActive = activeCities.some(ac => 
    combined.includes(ac.name.toLowerCase()) || 
    pickup.includes('ahmedabad') || 
    drop.includes('ahmedabad') ||
    pickup.includes('sg highway') ||
    drop.includes('sg highway') ||
    pickup.includes('navrangpura') ||
    drop.includes('navrangpura') ||
    pickup.includes('vastrapur') ||
    drop.includes('vastrapur')
  );

  const comingSoonBanner = document.getElementById('comingSoonBanner');
  const activeCityBanner = document.getElementById('activeCityBanner');
  const btnBook = document.getElementById('btnBookRide');

  if (detectedUnserved || (!matchesAnyActive && (pickup.length > 3 || drop.length > 3))) {
    const unservedName = detectedUnserved || (drop.length > 3 ? dropInput.value : pickupInput.value);
    const shortName = unservedName.split(',')[0].trim();

    if (comingSoonBanner) {
      comingSoonBanner.classList.remove('hidden');
      const cityNameEl = document.getElementById('comingSoonCityName');
      const cityRefEl = document.getElementById('comingSoonCityRef');
      if (cityNameEl) cityNameEl.innerText = shortName;
      if (cityRefEl) cityRefEl.innerText = shortName;
    }
    if (activeCityBanner) {
      activeCityBanner.style.display = 'none';
    }
    if (btnBook) {
      btnBook.disabled = true;
      btnBook.innerText = `SERVICE UNAVAILABLE IN ${shortName.toUpperCase()} (COMING SOON)`;
      btnBook.style.background = '#94A3B8';
      btnBook.style.boxShadow = 'none';
    }
    return false;
  } else {
    if (comingSoonBanner) {
      comingSoonBanner.classList.add('hidden');
    }
    if (activeCityBanner) {
      activeCityBanner.style.display = 'flex';
    }
    if (btnBook) {
      btnBook.disabled = false;
      btnBook.style.background = '#006FD4';
      btnBook.style.boxShadow = '';
    }
    updateFare();
    return true;
  }
}

function setQuickLocation(pickup, drop) {
  const pInput = document.getElementById('pickupAddr');
  const dInput = document.getElementById('dropAddr');
  if (pInput) pInput.value = pickup;
  if (dInput) dInput.value = drop;

  // Resolve coordinates from database if available
  const pMatch = LOCAL_GEO_DATABASE.find(l => l.name.toLowerCase().includes(pickup.toLowerCase().split(',')[0])) || LOCAL_GEO_DATABASE[0];
  const dMatch = LOCAL_GEO_DATABASE.find(l => l.name.toLowerCase().includes(drop.toLowerCase().split(',')[0])) || LOCAL_GEO_DATABASE[1];

  currentPickupCoords = { lat: pMatch.lat, lon: pMatch.lon, name: pickup };
  currentDropCoords = { lat: dMatch.lat, lon: dMatch.lon, name: drop };
  PICKUP_POS.label = pickup;
  DROP_POS.label = drop;

  recalculateDistanceAndRoute();

  // Update active chips
  const chips = document.querySelectorAll('.quick-loc-chips .loc-chip');
  chips.forEach(c => c.classList.remove('active'));
  if (window.event && window.event.target && window.event.target.classList.contains('loc-chip')) {
    window.event.target.classList.add('active');
  }

  checkServiceableLocations();
  updateFare();
  drawMap();
  drawCustMiniMap();
}

function resetToAhmedabadLocations() {
  setQuickLocation('SG Highway, Ahmedabad, Gujarat', 'Vastrapur Lake, Ahmedabad, Gujarat');
}

function joinCityWaitlist() {
  const cityName = document.getElementById('comingSoonCityName') ? document.getElementById('comingSoonCityName').innerText : 'your city';
  alert(`🎉 YOU'RE ON THE WAITLIST FOR ${cityName.toUpperCase()}!\n\nThank you for choosing Holido! We are scaling our Captain network in ${cityName} rapidly.\n\n🎁 You've earned ₹50 Free Ride Credit for Day 1 of our official launch in ${cityName}. We will notify you via SMS!`);
}

function selectService(service) {
  currentService = service;
  const isBike = service === 'BIKE_TAXI';

  document.getElementById('tabBike').classList.toggle('active', isBike);
  document.getElementById('tabParcel').classList.toggle('active', !isBike);

  const vehContainer = document.getElementById('vehicleSelectorContainer');
  if (vehContainer) vehContainer.classList.toggle('hidden', !isBike);

  document.getElementById('parcelFields').classList.toggle('hidden', isBike);

  updateFare();
}

// PARCEL CATEGORY & WEIGHT SELECTION CONTROLS
let selectedParcelCategory = 'DOCUMENTS';

function selectParcelCategory(category, el) {
  selectedParcelCategory = category;
  const pills = document.querySelectorAll('#parcelCategoryPills .pill');
  pills.forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');

  const catBadge = document.getElementById('selectedCategoryBadge');
  const catNames = {
    'DOCUMENTS': '📄 Documents',
    'BOX': '📦 Box',
    'FOOD': '🍔 Food',
    'ELECTRONICS': '📱 Electronics'
  };
  if (catBadge) {
    catBadge.innerText = catNames[category] || category;
  }
  updateFare();
}

function onParcelWeightChange(weightVal) {
  const customRow = document.getElementById('customWeightRow');
  if (customRow) {
    customRow.classList.toggle('hidden', weightVal !== 'CUSTOM_50_PLUS');
  }
  updateFare();
}

// COMPREHENSIVE DYNAMIC FARE ENGINE
function updateFare() {
  const cfg = getPricingConfig();
  const isBike = currentService === 'BIKE_TAXI';
  const weight = document.getElementById('parcelWeight') ? document.getElementById('parcelWeight').value : 'UP_TO_20KG';

  // 1. Get Platform Access Fee from Admin Config
  const platformFee = typeof cfg.platformFee === 'number' ? cfg.platformFee : 3.00;

  // 2. Get Surge Multiplier from Geo-Hex Demand Zones
  let surgeMultiplier = cfg.activeSurgeMultiplier || 1.0;
  let activeZoneName = 'Connaught Place';
  if (cfg.geoHexZones && cfg.geoHexZones.length > 0) {
    const defaultZone = cfg.geoHexZones.find(z => z.id === cfg.selectedGeoZone) || cfg.geoHexZones[0];
    if (defaultZone && defaultZone.multiplier > 1.0) {
      surgeMultiplier = defaultZone.multiplier;
      activeZoneName = defaultZone.name.split('&')[0].trim();
    }
  }

  // 3. Get Payment Convenience Fee from Selected Payment Method
  const payId = selectedPaymentMethod ? selectedPaymentMethod.id : 'CASH';
  const convFee = (cfg.paymentConvenienceFees && cfg.paymentConvenienceFees[payId] !== undefined)
    ? cfg.paymentConvenienceFees[payId]
    : 0.00;

  // Update Convenience Fee Pills in Payment Drawer
  if (cfg.paymentConvenienceFees) {
    ['CASH', 'UPI', 'WALLET', 'DEBIT_CARD', 'CREDIT_CARD', 'NETBANKING'].forEach(k => {
      const pill = document.getElementById(`pill-${k}`);
      if (pill) {
        const feeVal = cfg.paymentConvenienceFees[k] || 0.00;
        if (feeVal > 0) {
          pill.className = 'convenience-pill fee';
          pill.innerText = `+₹${feeVal.toFixed(0)} Fee`;
        } else {
          pill.className = 'convenience-pill free';
          pill.innerText = `₹0 Fee`;
        }
      }
    });
  }

  // Helper to calculate total for any vehicle with REAL DYNAMIC DISTANCE
  function calcVehicleTotal(vType) {
    const v = VEHICLE_DATA[vType];
    const base = v.baseFare;
    const chargeableKm = Math.max(0, currentTripDistanceKm - 1.5);
    const dist = Math.round(chargeableKm * v.perKmRate);
    const surgeAmt = Math.round((base + dist) * (surgeMultiplier - 1.0));
    const subtotal = (base + dist) + surgeAmt;
    const gst = Math.round((subtotal + platformFee + convFee) * 0.05);
    const total = Math.round(subtotal + platformFee + convFee + gst);
    return { base, dist, surgeAmt, subtotal, gst, total, v, chargeableKm };
  }

  // Update preview prices on the 3 Vehicle cards
  const bikeCalc = calcVehicleTotal('BIKE');
  const autoCalc = calcVehicleTotal('AUTO');
  const carCalc = calcVehicleTotal('CAR');

  const pBike = document.getElementById('price-BIKE');
  const pAuto = document.getElementById('price-AUTO');
  const pCar = document.getElementById('price-CAR');
  if (pBike) pBike.innerText = `₹${bikeCalc.total}`;
  if (pAuto) pAuto.innerText = `₹${autoCalc.total}`;
  if (pCar) pCar.innerText = `₹${carCalc.total}`;

  let finalBase = 25;
  let finalDist = 10;
  let finalSurgeAmt = 0;
  let finalTotal = 35;
  let finalGst = 2;
  let serviceName = 'Holido Bike (🏍️)';
  let serviceDesc = 'Fastest way through city traffic • 1 Seat';
  let safetyMsg = '🛡️ Sanitized Helmet Provided & Passenger Insured';
  let btnLabel = 'BOOK HOLIDO BIKE';

  if (isBike) {
    const activeCalc = calcVehicleTotal(selectedVehicleType);
    finalBase = activeCalc.base;
    finalDist = activeCalc.dist;
    finalSurgeAmt = activeCalc.surgeAmt;
    finalGst = activeCalc.gst;
    finalTotal = activeCalc.total;
    serviceName = `${activeCalc.v.name} (${activeCalc.v.icon})`;
    serviceDesc = activeCalc.v.desc;
    safetyMsg = activeCalc.v.safetyBadge;
    btnLabel = `BOOK ${activeCalc.v.name.toUpperCase()}`;
  } else {
    // Parcel Delivery
    // Weight options: 'UP_TO_20KG', '20_TO_50KG', 'CUSTOM_50_PLUS' (also legacy 'UP_TO_2KG' / 'TWO_TO_FIVE_KG')
    const customKgInput = document.getElementById('customWeightInput');
    const customKg = customKgInput ? (parseInt(customKgInput.value, 10) || 55) : 55;

    let catIcon = '📄';
    let catTitle = 'Documents';
    if (selectedParcelCategory === 'BOX') { catIcon = '📦'; catTitle = 'Box'; }
    else if (selectedParcelCategory === 'FOOD') { catIcon = '🍔'; catTitle = 'Food'; }
    else if (selectedParcelCategory === 'ELECTRONICS') { catIcon = '📱'; catTitle = 'Electronics'; }

    let weightLabel = 'Up to 20 kg';
    const chargeableKm = Math.max(0, currentTripDistanceKm - 1.5);
    const parcelDistRate = 12.0; // ₹12/km parcel rate
    finalDist = Math.round(chargeableKm * parcelDistRate);

    if (weight === 'CUSTOM_50_PLUS') {
      finalBase = 120 + Math.max(0, customKg - 50) * 2;
      weightLabel = `${customKg} kg (Commercial Freight)`;
      serviceName = `Holido Parcel ${catTitle} (${catIcon})`;
      serviceDesc = `Custom Heavy Freight (${customKg} kg) • Dedicated Two-Wheeler / Cargo`;
    } else if (weight === '20_TO_50KG' || weight === 'TWO_TO_FIVE_KG') {
      finalBase = 75;
      weightLabel = '20 kg to 50 kg';
      serviceName = `Holido Parcel ${catTitle} (${catIcon})`;
      serviceDesc = `Heavy Package (20 to 50 kg) • Safe Handling & Secure Strap`;
    } else {
      // UP_TO_20KG (or UP_TO_2KG)
      finalBase = 45;
      weightLabel = 'Up to 20 kg';
      serviceName = `Holido Parcel ${catTitle} (${catIcon})`;
      serviceDesc = `Standard Courier (${catTitle}) • Up to 20 kg Package`;
    }

    finalSurgeAmt = Math.round((finalBase + finalDist) * (surgeMultiplier - 1.0));
    const parcelSubtotal = (finalBase + finalDist) + finalSurgeAmt;
    finalGst = Math.round((parcelSubtotal + platformFee + convFee) * 0.05);
    finalTotal = Math.round(parcelSubtotal + platformFee + convFee + finalGst);
    safetyMsg = '🛡️ Secure Doorstep OTP Verification & Sealed Transit';
    btnLabel = `BOOK HOLIDO ${catTitle.toUpperCase()} PARCEL`;
  }

  // Update UI Elements
  const elFare = document.getElementById('custFare');
  const elBase = document.getElementById('fareBase');
  const elDist = document.getElementById('fareDist');
  const elPlatform = document.getElementById('farePlatformFee');
  const elGst = document.getElementById('fareGst');
  const elServiceName = document.getElementById('selectedServiceName');
  const elServiceDesc = document.getElementById('selectedServiceDesc');
  const elSafetyBadge = document.getElementById('fareSafetyBadge');
  const elBtnBook = document.getElementById('btnBookRide');

  if (elFare) elFare.innerText = `₹${finalTotal}`;
  if (elBase) elBase.innerText = `₹${finalBase}`;
  if (elDist) elDist.innerText = `₹${finalDist}`;
  if (elPlatform) elPlatform.innerText = `₹${platformFee.toFixed(2)}`;
  if (elGst) elGst.innerText = `₹${finalGst.toFixed(2)}`;
  if (elServiceName) elServiceName.innerText = serviceName;
  if (elServiceDesc) elServiceDesc.innerText = serviceDesc;
  if (elSafetyBadge) elSafetyBadge.innerText = safetyMsg;
  if (elBtnBook) elBtnBook.innerText = btnLabel;

  // Real-time trip distance & duration estimation UI
  const elKm = document.getElementById('displayTripKm');
  const elEta = document.getElementById('displayTripEta');
  const elRate = document.getElementById('displayRatePerKm');
  if (elKm) elKm.innerText = `${currentTripDistanceKm.toFixed(1)} km`;
  if (elEta) elEta.innerText = `${currentTripDurationMin} mins`;
  if (elRate) {
    const r = isBike ? (VEHICLE_DATA[selectedVehicleType]?.perKmRate || 10) : 12;
    elRate.innerText = `₹${r}/km`;
  }

  // Surge Multiplier UI Row & Banner
  const surgeBanner = document.getElementById('fareSurgeBanner');
  const rowSurge = document.getElementById('rowFareSurge');
  const elSurgeAmt = document.getElementById('fareSurgeAmount');
  const elSurgeZone = document.getElementById('fareSurgeZoneName');
  const elSurgeMult = document.getElementById('fareSurgeMultiplierBadge');

  if (surgeMultiplier > 1.0) {
    if (surgeBanner) surgeBanner.classList.remove('hidden');
    if (rowSurge) rowSurge.classList.remove('hidden');
    if (elSurgeAmt) elSurgeAmt.innerText = `+₹${finalSurgeAmt}`;
    if (elSurgeZone) elSurgeZone.innerText = `${activeZoneName} Surge`;
    if (elSurgeMult) elSurgeMult.innerText = `${surgeMultiplier.toFixed(1)}x`;
  } else {
    if (surgeBanner) surgeBanner.classList.add('hidden');
    if (rowSurge) rowSurge.classList.add('hidden');
  }

  // Convenience Fee UI Row
  const rowConv = document.getElementById('rowFareConv');
  const elConvFee = document.getElementById('fareConvFee');
  const elConvLabel = document.getElementById('fareConvLabel');
  if (convFee > 0) {
    if (rowConv) rowConv.classList.remove('hidden');
    if (elConvFee) elConvFee.innerText = `+₹${convFee.toFixed(2)}`;
    if (elConvLabel) elConvLabel.innerText = `Fee (${selectedPaymentMethod.name}):`;
  } else {
    if (rowConv) rowConv.classList.add('hidden');
  }
}

// Step 1: Customer Requests Ride
function customerRequestRide() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const isBike = currentService === 'BIKE_TAXI';
  const fareStr = document.getElementById('custFare').innerText.replace('₹', '');
  const fareVal = parseInt(fareStr, 10) || (isBike ? 35 : 49);
  const earningVal = Math.round(fareVal * 0.80);

  const selectedVeh = VEHICLE_DATA[selectedVehicleType] || VEHICLE_DATA.BIKE;

  const weight = document.getElementById('parcelWeight') ? document.getElementById('parcelWeight').value : 'UP_TO_20KG';
  const customKgInput = document.getElementById('customWeightInput');
  const customKg = customKgInput ? (parseInt(customKgInput.value, 10) || 55) : 55;

  let parcelDetailsText = '';
  if (!isBike) {
    const weightLabel = weight === 'CUSTOM_50_PLUS' ? `${customKg} kg` : (weight === '20_TO_50KG' ? '20 to 50 kg' : 'Up to 20 kg');
    parcelDetailsText = `${selectedParcelCategory} (${weightLabel})`;
  }

  const pickupVal = document.getElementById('pickupAddr') ? document.getElementById('pickupAddr').value : 'SG Highway, Ahmedabad, Gujarat';
  const dropVal = document.getElementById('dropAddr') ? document.getElementById('dropAddr').value : 'Vastrapur Lake, Ahmedabad, Gujarat';

  activeRide = {
    id: 'HLD-TRIP-' + Math.floor(Math.random() * 8999 + 1000),
    serviceType: currentService,
    vehicleType: isBike ? selectedVehicleType : 'PARCEL',
    vehicleObj: isBike ? selectedVeh : { name: `Parcel - ${parcelDetailsText}`, icon: '📦' },
    status: 'SEARCHING_CAPTAIN',
    otp: otp,
    fare: fareVal,
    baseFare: isBike ? selectedVeh.baseFare : 35,
    distCharge: Math.round(Math.max(0, currentTripDistanceKm - 1.5) * (isBike ? selectedVeh.perKmRate : 12)),
    platformFee: 3.00,
    gst: Math.round(fareVal * 0.05),
    earning: earningVal,
    payment: { ...selectedPaymentMethod },
    pickup: pickupVal,
    drop: dropVal,
    distanceKm: currentTripDistanceKm,
    durationMin: currentTripDurationMin,
    parcelCategory: selectedParcelCategory,
    parcelWeight: weight,
    parcelDetails: parcelDetailsText
  };

  document.getElementById('activeRideCount').innerText = '1';

  // Switch Customer App to Tracking View
  document.getElementById('custBookingView').classList.add('hidden');
  document.getElementById('custTrackingView').classList.remove('hidden');
  document.getElementById('displayOtp').innerText = otp;
  document.getElementById('custStatusText').innerText = 'Searching nearby Captains...';

  // Update In-App Radar Map Status
  const radarStatus = document.getElementById('custRadarStatus');
  if (radarStatus) {
    radarStatus.innerText = '📡 Scanning 1.5 km: 3 Captains Nearby (0.4 - 1.1 km)';
  }

  // Update Live Payment Display on Customer App
  const trackPay = document.getElementById('trackingPayMode');
  if (trackPay) {
    trackPay.innerText = `${activeRide.payment.icon} ${activeRide.payment.name} (₹${activeRide.fare})`;
  }

  setToast(`Holido Engine searching Captain... [Payment: ${activeRide.payment.name}]`);

  // Trigger Captain App incoming alert after 1 second
  setTimeout(() => {
    triggerIncomingCaptainAlert();
  }, 1000);
}

// Step 2: Captain Phone Buzzes with 15-second radial countdown
function triggerIncomingCaptainAlert() {
  const modal = document.getElementById('incomingOfferModal');
  modal.classList.remove('hidden');

  let offerTitle = 'BIKE TAXI REQUEST';
  if (currentService === 'PARCEL_DELIVERY') {
    offerTitle = `📦 PARCEL (${activeRide.parcelDetails || 'STANDARD'})`;
  } else if (activeRide && activeRide.vehicleObj) {
    offerTitle = `${activeRide.vehicleObj.icon} ${activeRide.vehicleObj.name.toUpperCase()} REQUEST`;
  }
  document.getElementById('offerBadge').innerText = offerTitle;
  document.getElementById('offerEarning').innerText = `Earn ₹${activeRide.earning}`;

  const offerP = document.getElementById('offerPickup');
  const offerD = document.getElementById('offerDrop');
  if (offerP && activeRide.pickup) offerP.innerText = activeRide.pickup;
  if (offerD && activeRide.drop) offerD.innerText = activeRide.drop;

  const offerPay = document.getElementById('offerPayMode');
  if (offerPay && activeRide && activeRide.payment) {
    offerPay.innerText = `${activeRide.payment.icon} Payment: ${activeRide.payment.name}`;
  }

  let secs = 15;
  document.getElementById('countdownSecs').innerText = secs;

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    secs--;
    document.getElementById('countdownSecs').innerText = secs;
    if (secs <= 0) {
      clearInterval(countdownInterval);
      rejectOffer();
    }
  }, 1000);

  setToast('⚡ Incoming Ride Alert pushed to Captain Rahul!');
}

function rejectOffer() {
  clearInterval(countdownInterval);
  document.getElementById('incomingOfferModal').classList.add('hidden');
  setToast('Captain passed offer. Re-routing to next captain...');
}

// Step 3: Captain Accepts Ride
function acceptOffer() {
  clearInterval(countdownInterval);
  document.getElementById('incomingOfferModal').classList.add('hidden');
  document.getElementById('capTripControl').classList.remove('hidden');
  document.getElementById('capTripStage').innerText = 'Heading to Pickup';

  const capTripPay = document.getElementById('capTripPayMode');
  if (capTripPay && activeRide && activeRide.payment) {
    capTripPay.innerText = `${activeRide.payment.icon} ${activeRide.payment.name} (₹${activeRide.fare})`;
  }

  activeRide.status = 'CAPTAIN_ASSIGNED';

  // Match Captain vehicle to what Captain registered
  const capVeh = VEHICLE_DATA[captainRegisteredVehicle] || VEHICLE_DATA.BIKE;
  const custCapVeh = document.getElementById('custCapVehicle');
  const custCapAvatar = document.querySelector('#custCaptainInfo .cap-avatar');
  if (custCapVeh) custCapVeh.innerText = `${capVeh.model} • ${capVeh.plate}`;
  if (custCapAvatar) custCapAvatar.innerText = capVeh.icon;

  // Customer app updates
  document.getElementById('custStatusText').innerText = `${capVeh.name} Captain is on the way!`;
  const radarStatus = document.getElementById('custRadarStatus');
  if (radarStatus) {
    radarStatus.innerText = '✅ Captain Rahul Matched! Approaching pickup (ETA 2 mins)';
  }
  setToast('Captain Rahul accepted! Driving to pickup...');

  // Animate Captain bike from current pos to pickup (PICKUP_POS)
  animateBikeTo(PICKUP_POS, () => {
    setToast('Captain has reached pickup point.');
  });
}

// Step 4: Captain Arrives at Pickup
function captainArriveAtPickup() {
  activeRide.status = 'CAPTAIN_ARRIVED';
  document.getElementById('btnCapArrive').classList.add('hidden');
  document.getElementById('capOtpSection').classList.remove('hidden');
  document.getElementById('capTripStage').innerText = 'Arrived at Pickup';

  document.getElementById('custStatusText').innerText = 'Captain has arrived at your location!';
  const radarStatusArrive = document.getElementById('custRadarStatus');
  if (radarStatusArrive) {
    radarStatusArrive.innerText = '📍 Captain Rahul reached pickup! Share 4-digit OTP.';
  }
  setToast('Captain Rahul reached! Waiting for 4-digit OTP.');
}

// Step 5: Captain Verifies Customer OTP
function captainVerifyOtp() {
  const entered = document.getElementById('capInputOtp').value.trim();
  if (entered !== activeRide.otp) {
    alert(`Invalid OTP! Please enter the customer's OTP: ${activeRide.otp}`);
    return;
  }

  activeRide.status = 'IN_PROGRESS';
  document.getElementById('capOtpSection').classList.add('hidden');
  
  const btnComplete = document.getElementById('btnCapComplete');
  btnComplete.classList.remove('hidden');
  if (activeRide.payment.id === 'CASH') {
    btnComplete.innerText = `COLLECT CASH ₹${activeRide.fare} & COMPLETE`;
  } else {
    btnComplete.innerText = `CONFIRM ${activeRide.payment.id} PREPAID (₹${activeRide.fare})`;
  }

  document.getElementById('capTripStage').innerText = 'Trip in Progress to Drop';

  document.getElementById('custStatusText').innerText = 'Heading to destination. Wear your helmet!';
  const radarStatusTransit = document.getElementById('custRadarStatus');
  if (radarStatusTransit) {
    radarStatusTransit.innerText = '🚀 In Transit to Connaught Place • Helmet ON';
  }
  setToast('OTP Verified! 🚀 Trip in progress towards Connaught Place.');

  // Animate bike from Pickup to Drop
  animateBikeTo(DROP_POS, () => {
    setToast('Reached destination Connaught Place! Ready to complete trip.');
  });
}

// Step 6: Captain Completes Ride
function captainCompleteTrip() {
  activeRide.status = 'COMPLETED';

  // Update Captain Earnings
  const currentEarnings = parseInt(document.getElementById('capEarnings').innerText.replace('₹', ''));
  const newEarnings = currentEarnings + activeRide.earning;
  document.getElementById('capEarnings').innerText = `₹${newEarnings}`;

  // Reset Captain App UI
  document.getElementById('capTripControl').classList.add('hidden');
  document.getElementById('btnCapArrive').classList.remove('hidden');
  document.getElementById('btnCapComplete').classList.add('hidden');

  // Save Completed Trip to Customer History in localStorage
  saveCompletedTripToHistory({
    id: activeRide.id || `HLD-TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
    serviceType: activeRide.serviceType,
    vehicleName: activeRide.vehicleObj?.name || 'Holido Ride',
    vehicleIcon: activeRide.vehicleObj?.icon || '🏍️',
    pickup: activeRide.pickup,
    drop: activeRide.drop,
    distanceKm: activeRide.distanceKm || currentTripDistanceKm,
    durationMin: activeRide.durationMin || currentTripDurationMin,
    totalFare: activeRide.fare,
    baseFare: activeRide.baseFare || 25,
    distCharge: activeRide.distCharge || 33,
    platformFee: activeRide.platformFee || 3,
    gst: activeRide.gst || 3,
    paymentMethod: activeRide.payment?.name || 'Cash',
    captainName: 'Rajesh Patel (Hero Splendor Plus)',
    rating: 5,
    feedback: 'Very punctual and polite rider. Provided sanitized helmet and rode safely!',
    dateStr: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    status: 'COMPLETED'
  });

  // Customer App: Show Anonymous Review Form
  document.getElementById('custTrackingView').classList.add('hidden');
  const reviewModal = document.getElementById('custReviewModal');
  if (reviewModal) {
    reviewModal.classList.remove('hidden');
    const isBike = currentService === 'BIKE_TAXI';
    document.getElementById('anonymousShieldBadge').innerText = isBike ? '"Verified Holido Rider 🛡️"' : '"Verified Parcel Sender 🛡️"';
    document.getElementById('reviewCommentInput').value = isBike
      ? 'Very punctual and polite rider. Provided sanitized helmet and rode safely!'
      : 'Handled fragile package with care and delivered promptly!';
  } else {
    document.getElementById('custBookingView').classList.remove('hidden');
  }

  document.getElementById('activeRideCount').innerText = '0';
  setToast('Trip Completed! Fare settled & anonymous feedback requested.');
}

let customerSelectedRating = 5;

function setRating(rating) {
  customerSelectedRating = rating;
  const stars = document.querySelectorAll('#starContainer span');
  stars.forEach((s, idx) => {
    s.style.color = idx < rating ? '#F59E0B' : '#94A3B8';
  });
}

function submitCustomerReview() {
  const comment = document.getElementById('reviewCommentInput').value.trim();
  const isBike = currentService === 'BIKE_TAXI';
  const badge = isBike ? 'Verified Holido Rider 🛡️' : 'Verified Parcel Sender 🛡️';

  // Update latest trip in history with rating
  const trips = getCustomerTrips();
  if (trips.length > 0) {
    trips[0].rating = customerSelectedRating;
    trips[0].feedback = comment;
    localStorage.setItem('holido_customer_trips', JSON.stringify(trips));
  }

  document.getElementById('custReviewModal').classList.add('hidden');
  document.getElementById('custBookingView').classList.remove('hidden');

  alert(
    `🎉 ANONYMOUS REVIEW SUBMITTED!\n\n` +
    `• Service: ${isBike ? 'Bike Taxi' : 'Parcel Delivery'}\n` +
    `• Rating: ${customerSelectedRating} ★\n` +
    `• Public Badge: ${badge}\n` +
    `• Review: "${comment}"\n\n` +
    `🛡️ Safety Shield Active: Your personal name and contact details are permanently hidden from the Captain. It appears on Captain's profile anonymously!`
  );

  setToast('Anonymous review recorded. Ready for next trip!');
}
    `• Service: ${isBike ? 'Bike Taxi' : 'Parcel Delivery'}\n` +
    `• Rating: ${customerSelectedRating} ★\n` +
    `• Public Badge: ${badge}\n` +
    `• Review: "${comment}"\n\n` +
    `🛡️ Safety Shield Active: Your personal name and contact details are permanently hidden from the Captain. It appears on Captain's profile anonymously!`
  );

  setToast('Anonymous review recorded. Ready for next trip!');
}

function skipCustomerReview() {
  const reviewModal = document.getElementById('custReviewModal');
  if (reviewModal) reviewModal.classList.add('hidden');

  const bookingView = document.getElementById('custBookingView');
  if (bookingView) bookingView.classList.remove('hidden');

  // Reset inputs
  customerSelectedRating = 5;
  const stars = document.querySelectorAll('#starContainer span');
  stars.forEach((s) => {
    s.style.color = '#F59E0B';
  });

  const commentInput = document.getElementById('reviewCommentInput');
  if (commentInput) commentInput.value = '';

  setToast('Rating skipped. Welcome back to Holido home!');
}

function promptRandomDaytimeSelfie() {
  setToast('📸 Triggering random daytime selfie audit prompt...');
  setTimeout(() => {
    alert(
      `📸 HOLIDO RANDOM DAYTIME SELFIE AUDIT\n\n` +
      `• Captain: Rahul Sharma (CAP-101)\n` +
      `• Prompt Type: Random Daytime Audit (Anti-Account Sharing)\n` +
      `• Biometric Face Match: 99.4% (PASS)\n` +
      `• Helmet Detection: PASS (Sanitized Safety Helmet Verified)\n` +
      `• Verification Latency: 1.8 seconds\n\n` +
      `✅ Captain identity confirmed. Active online status maintained!`
    );
    setToast('Daytime selfie audit passed successfully (99.4% match).');
  }, 400);
}

// Smooth Bike Animation along road
function animateBikeTo(destination, onComplete) {
  cancelAnimationFrame(bikeAnimationId);

  const startX = captainPos.x;
  const startY = captainPos.y;
  const endX = destination.x;
  const endY = destination.y;

  let progress = 0;
  const duration = 180; // frames (~3 seconds at 60fps)

  function step() {
    progress += 1;
    const t = Math.min(progress / duration, 1);
    // Smooth easeInOut
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    captainPos.x = startX + (endX - startX) * ease;
    captainPos.y = startY + (endY - startY) * ease;

    drawMap();

    if (t < 1) {
      bikeAnimationId = requestAnimationFrame(step);
    } else {
      if (onComplete) onComplete();
    }
  }

  bikeAnimationId = requestAnimationFrame(step);
}

function setToast(msg) {
  const toast = document.getElementById('mapToast');
  toast.innerText = msg;
  toast.style.opacity = '1';
}

function toggleCaptainOnline(isOnline) {
  if (!isOnline) {
    rejectOffer();
    setToast('Captain went OFFLINE. Won\'t receive ride requests.');
  } else {
    setToast('Captain is now ONLINE & ready to take trips.');
  }
}

function triggerSos() {
  alert('🚨 SOS SAFETY PROTOCOL TRIGGERED!\n\n1. Holido 24x7 Safety Command Center Alerted.\n2. Emergency contacts notified with live GPS track.\n3. Police emergency services dispatched to current location.');
}

function resetDemo() {
  cancelAnimationFrame(bikeAnimationId);
  clearInterval(countdownInterval);
  activeRide = null;
  captainPos = { x: 90, y: 520, angle: 0 };

  document.getElementById('custTrackingView').classList.add('hidden');
  const reviewModal = document.getElementById('custReviewModal');
  if (reviewModal) reviewModal.classList.add('hidden');
  document.getElementById('custBookingView').classList.remove('hidden');
  document.getElementById('incomingOfferModal').classList.add('hidden');
  document.getElementById('capTripControl').classList.add('hidden');
  document.getElementById('btnCapArrive').classList.remove('hidden');
  document.getElementById('btnCapComplete').classList.add('hidden');
  document.getElementById('capOtpSection').classList.add('hidden');
  document.getElementById('activeRideCount').innerText = '0';
  document.getElementById('capInputOtp').value = '';

  const radarStatusReset = document.getElementById('custRadarStatus');
  if (radarStatusReset) {
    radarStatusReset.innerText = 'Radar: 3 Captains active nearby';
  }

  setToast('Demo reset. Ready to test!');
  drawMap();
}

// Automated 1-Click Showcase
function triggerAutoDemo() {
  resetDemo();
  setToast('Starting 1-Click Automated Showcase...');

  setTimeout(() => {
    customerRequestRide();

    setTimeout(() => {
      acceptOffer();

      setTimeout(() => {
        captainArriveAtPickup();

        setTimeout(() => {
          document.getElementById('capInputOtp').value = activeRide.otp;
          captainVerifyOtp();

          setTimeout(() => {
            captainCompleteTrip();
          }, 4500);
        }, 1500);
      }, 3500);
    }, 2000);
  }, 800);
}

// Start
initMap();
checkServiceableLocations();

// Listen for pricing & city changes from Admin Command Center
window.addEventListener('storage', (e) => {
  if (e.key === 'holido_pricing_config') {
    updateFare();
    setToast('⚡ Live Pricing & Surge updated from Super Admin Center!');
  }
  if (e.key === 'holido_city_config') {
    checkServiceableLocations();
    setToast('📍 City Service Zones updated from Super Admin Center!');
  }
});

// ================= MOBILE NAVIGATION & PWA LOGIC =================
function switchMobileView(mode) {
  const colCust = document.getElementById('colCust');
  const colMap = document.getElementById('colMap');
  const colCap = document.getElementById('colCap');
  const btnCust = document.getElementById('btnMobCust');
  const btnMap = document.getElementById('btnMobMap');
  const btnCap = document.getElementById('btnMobCap');

  if (!colCust || !colMap || !colCap) return;

  colCust.classList.remove('mob-active');
  colMap.classList.remove('mob-active');
  colCap.classList.remove('mob-active');

  if (btnCust) btnCust.classList.remove('active');
  if (btnMap) btnMap.classList.remove('active');
  if (btnCap) btnCap.classList.remove('active');

  if (mode === 'cust') {
    colCust.classList.add('mob-active');
    if (btnCust) btnCust.classList.add('active');
  } else if (mode === 'map') {
    colMap.classList.add('mob-active');
    if (btnMap) btnMap.classList.add('active');
    if (typeof drawMap === 'function') drawMap();
  } else if (mode === 'cap') {
    colCap.classList.add('mob-active');
    if (btnCap) btnCap.classList.add('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Register PWA Service Worker for Mobile 1-Click Installation
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Holido PWA ServiceWorker registered with scope:', reg.scope))
      .catch(err => console.log('Holido PWA ServiceWorker registration failed:', err));
  });
}

// ================= CUSTOMER NAVIGATION & VIEW SWITCHER =================
function switchCustomerTab(tab) {
  const viewBooking = document.getElementById('custBookingView');
  const viewTracking = document.getElementById('custTrackingView');
  const viewTrips = document.getElementById('custTripsView');
  const viewProfile = document.getElementById('custProfileView');
  const reviewModal = document.getElementById('custReviewModal');
  const serviceTabsRow = document.getElementById('custServiceTabsRow');

  const btnBook = document.getElementById('cnavBook');
  const btnTrips = document.getElementById('cnavTrips');
  const btnProfile = document.getElementById('cnavProfile');

  [btnBook, btnTrips, btnProfile].forEach(b => b?.classList.remove('active'));
  [viewBooking, viewTracking, viewTrips, viewProfile, reviewModal].forEach(v => v?.classList.add('hidden'));

  if (tab === 'BOOKING') {
    btnBook?.classList.add('active');
    serviceTabsRow?.classList.remove('hidden');
    if (activeRide && activeRide.status !== 'COMPLETED') {
      viewTracking?.classList.remove('hidden');
    } else {
      viewBooking?.classList.remove('hidden');
    }
  } else if (tab === 'TRIPS') {
    btnTrips?.classList.add('active');
    serviceTabsRow?.classList.add('hidden');
    viewTrips?.classList.remove('hidden');
    renderCustomerTrips('ALL');
  } else if (tab === 'PROFILE') {
    btnProfile?.classList.add('active');
    serviceTabsRow?.classList.add('hidden');
    viewProfile?.classList.remove('hidden');
    renderCustomerProfile();
  }
}

// ================= CUSTOMER PROFILE & ACCOUNT ENGINE =================
const DEFAULT_CUSTOMER_PROFILE = {
  name: 'Akshay Kumar',
  phone: '+91 98765 43210',
  email: 'akshay.kumar@gmail.com',
  rating: 4.95,
  totalTrips: 28,
  walletBalance: 350.00,
  coins: 180,
  emergencyContact: 'Family (+91 98250 12345)'
};

function getCustomerProfile() {
  try {
    const raw = localStorage.getItem('holido_customer_profile');
    if (raw) return { ...DEFAULT_CUSTOMER_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading customer profile:', e);
  }
  return DEFAULT_CUSTOMER_PROFILE;
}

function renderCustomerProfile() {
  const prof = getCustomerProfile();
  const nameEl = document.getElementById('profNameDisplay');
  const phoneEl = document.getElementById('profPhoneDisplay');
  const avatarEl = document.getElementById('profAvatarText');
  const walletEl = document.getElementById('profWalletBalance');
  const coinsEl = document.getElementById('profCoinsBalance');
  const sosEl = document.getElementById('profSosContact');

  if (nameEl) nameEl.innerText = prof.name;
  if (phoneEl) phoneEl.innerText = prof.phone;
  if (avatarEl) {
    const initials = prof.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEl.innerText = initials || 'AK';
  }
  if (walletEl) walletEl.innerText = `₹${prof.walletBalance.toFixed(2)}`;
  if (coinsEl) coinsEl.innerText = `${prof.coins} 🪙`;
  if (sosEl) sosEl.innerText = prof.emergencyContact;
}

function openEditProfileModal() {
  const prof = getCustomerProfile();
  document.getElementById('editProfName').value = prof.name;
  document.getElementById('editProfPhone').value = prof.phone;
  document.getElementById('editProfEmail').value = prof.email;
  document.getElementById('editProfSos').value = prof.emergencyContact;
  document.getElementById('custEditProfileModal')?.classList.remove('hidden');
}

function closeEditProfileModal() {
  document.getElementById('custEditProfileModal')?.classList.add('hidden');
}

function saveCustomerProfile() {
  const name = document.getElementById('editProfName').value.trim() || 'Holido Rider';
  const phone = document.getElementById('editProfPhone').value.trim() || '+91 98765 43210';
  const email = document.getElementById('editProfEmail').value.trim() || 'rider@holido.in';
  const emergencyContact = document.getElementById('editProfSos').value.trim() || 'Family (+91 98250 12345)';

  const prof = getCustomerProfile();
  const updated = { ...prof, name, phone, email, emergencyContact };
  localStorage.setItem('holido_customer_profile', JSON.stringify(updated));
  closeEditProfileModal();
  renderCustomerProfile();
  setToast('✅ Customer profile updated successfully!');
}

function openCreateProfileModal() {
  const newName = prompt('Enter New Customer Full Name (e.g. Rahul Sharma):', 'Rahul Sharma');
  if (!newName) return;
  const newPhone = prompt('Enter Customer Mobile Number:', '+91 98250 99887') || '+91 98250 99887';
  const updated = {
    ...DEFAULT_CUSTOMER_PROFILE,
    name: newName,
    phone: newPhone,
    email: `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    walletBalance: 200.00,
    coins: 50
  };
  localStorage.setItem('holido_customer_profile', JSON.stringify(updated));
  renderCustomerProfile();
  setToast(`🎉 Welcome ${newName}! Customer account created & loaded.`);
}

function addMoneyToWallet() {
  const amountStr = prompt('Enter amount to add to Holido Wallet (₹):', '500');
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return;
  const prof = getCustomerProfile();
  prof.walletBalance += amount;
  localStorage.setItem('holido_customer_profile', JSON.stringify(prof));
  renderCustomerProfile();
  setToast(`💳 ₹${amount.toFixed(2)} added to Holido Wallet! New balance: ₹${prof.walletBalance.toFixed(2)}`);
}

function quickBookSavedPlace(addr) {
  const dropInput = document.getElementById('dropAddr');
  if (dropInput) {
    dropInput.value = addr;
    handleLocationInput('drop', addr);
  }
  switchCustomerTab('BOOKING');
  setToast(`📍 Destination set to: ${addr}`);
}

// ================= CUSTOMER TRIP HISTORY & TAX INVOICE ENGINE =================
const DEFAULT_TRIP_HISTORY = [
  {
    id: 'HLD-TRIP-7491',
    serviceType: 'BIKE_TAXI',
    vehicleName: 'Holido Bike',
    vehicleIcon: '🏍️',
    pickup: 'SG Highway, Ahmedabad, Gujarat',
    drop: 'Vastrapur Lake, Ahmedabad, Gujarat',
    distanceKm: 4.8,
    durationMin: 12,
    totalFare: 64,
    baseFare: 25,
    distCharge: 33,
    platformFee: 3,
    gst: 3,
    paymentMethod: 'UPI (Google Pay)',
    captainName: 'Rajesh Patel (Hero Splendor Plus)',
    rating: 5,
    feedback: 'Very punctual and polite rider. Provided clean helmet!',
    dateStr: '24 Nov 2026, 05:42 PM',
    status: 'COMPLETED'
  },
  {
    id: 'HLD-TRIP-6820',
    serviceType: 'PARCEL_DELIVERY',
    vehicleName: 'Parcel - Box (Up to 20kg)',
    vehicleIcon: '📦',
    pickup: 'Navrangpura, Ahmedabad, Gujarat',
    drop: 'C.G. Road, Ahmedabad, Gujarat',
    distanceKm: 3.1,
    durationMin: 9,
    totalFare: 55,
    baseFare: 35,
    distCharge: 19,
    platformFee: 3,
    gst: 3,
    paymentMethod: 'Cash',
    captainName: 'Mukesh Sharma (Honda Activa)',
    rating: 5,
    feedback: 'Handled fragile package with extra care.',
    dateStr: '22 Nov 2026, 02:15 PM',
    status: 'COMPLETED'
  },
  {
    id: 'HLD-TRIP-5192',
    serviceType: 'BIKE_TAXI',
    vehicleName: 'Holido Auto',
    vehicleIcon: '🛺',
    pickup: 'Maninagar, Ahmedabad, Gujarat',
    drop: 'Kalupur Railway Station, Ahmedabad, Gujarat',
    distanceKm: 5.4,
    durationMin: 16,
    totalFare: 98,
    baseFare: 35,
    distCharge: 55,
    platformFee: 3,
    gst: 5,
    paymentMethod: 'Holido Wallet',
    captainName: 'Irfan Khan (Bajaj RE Compact)',
    rating: 4,
    feedback: 'Fast ride through station traffic.',
    dateStr: '20 Nov 2026, 09:30 AM',
    status: 'COMPLETED'
  }
];

function getCustomerTrips() {
  try {
    const raw = localStorage.getItem('holido_customer_trips');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading trips from storage:', e);
  }
  return DEFAULT_TRIP_HISTORY;
}

function saveCompletedTripToHistory(newTrip) {
  const trips = getCustomerTrips();
  trips.unshift(newTrip);
  localStorage.setItem('holido_customer_trips', JSON.stringify(trips));
  updateTripBadges();
}

function updateTripBadges() {
  const trips = getCustomerTrips();
  const badge = document.getElementById('cnavTripBadge');
  const pill = document.getElementById('tripsCountPill');
  if (badge) badge.innerText = trips.length;
  if (pill) pill.innerText = `${trips.length} Trips`;
}

function renderCustomerTrips(filter = 'ALL') {
  const container = document.getElementById('customerTripsListContainer');
  if (!container) return;
  const trips = getCustomerTrips();
  updateTripBadges();

  let filtered = trips;
  if (filter === 'BIKE') filtered = trips.filter(t => t.vehicleName && t.vehicleName.toLowerCase().includes('bike'));
  else if (filter === 'AUTO') filtered = trips.filter(t => t.vehicleName && t.vehicleName.toLowerCase().includes('auto'));
  else if (filter === 'CAR') filtered = trips.filter(t => t.vehicleName && (t.vehicleName.toLowerCase().includes('cab') || t.vehicleName.toLowerCase().includes('car')));
  else if (filter === 'PARCEL') filtered = trips.filter(t => t.serviceType === 'PARCEL_DELIVERY' || (t.vehicleName && t.vehicleName.toLowerCase().includes('parcel')));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:#64748B;">
        <span style="font-size:32px;">📜</span>
        <p style="font-size:12px; margin-top:8px;">No trips found in this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => `
    <div class="trip-card-item">
      <div class="trip-card-head">
        <div class="trip-type-badge">
          <span>${t.vehicleIcon || '🏍️'}</span>
          <span>${t.vehicleName}</span>
        </div>
        <span class="trip-status-pill">${t.status || 'COMPLETED'}</span>
      </div>

      <div style="font-size:10px; color:#64748B;">📅 ${t.dateStr} • Trip ID: <b>${t.id}</b></div>

      <div class="trip-route-box">
        <div class="trip-route-row">
          <span style="color:#059669; font-size:12px;">●</span>
          <span><b>Pickup:</b> ${t.pickup}</span>
        </div>
        <div class="trip-route-row">
          <span style="color:#DC2626; font-size:12px;">■</span>
          <span><b>Drop:</b> ${t.drop}</span>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; background:#F8FAFC; padding:6px 8px; border-radius:6px;">
        <span>📏 <b>${t.distanceKm} km</b> • ⏱️ ${t.durationMin} mins</span>
        <span>💳 <b>${t.paymentMethod}</b></span>
      </div>

      <div class="trip-card-footer">
        <div>
          <span class="trip-fare-txt">₹${t.totalFare}</span>
          <span style="font-size:10px; color:#64748B;">(incl. taxes)</span>
        </div>
        <button class="btn-invoice" onclick="viewTripInvoice('${t.id}')">🧾 View Tax Invoice</button>
      </div>
    </div>
  `).join('');
}

function filterTrips(type, btn) {
  const pills = btn.parentElement.querySelectorAll('.pill');
  pills.forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderCustomerTrips(type);
}

function viewTripInvoice(tripId) {
  const trips = getCustomerTrips();
  const trip = trips.find(t => t.id === tripId) || trips[0];
  if (!trip) return;

  const prof = getCustomerProfile();
  const modal = document.getElementById('custInvoiceModal');
  const content = document.getElementById('invoicePaperContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="text-align:center; border-bottom:2px dashed #CBD5E1; padding-bottom:14px; margin-bottom:12px;">
      <div style="font-size:22px; font-weight:900; color:#042045;">HOLIDO MOBILITY</div>
      <div style="font-size:10px; color:#64748B;">Holido Technologies Pvt. Ltd. • GSTIN: 24AABCH1234F1Z6</div>
      <div style="font-size:12px; font-weight:800; color:#006FD4; margin-top:4px;">TAX INVOICE / RIDE RECEIPT</div>
    </div>

    <div style="font-size:11px; line-height:1.5; margin-bottom:12px; color:#334155;">
      <div><b>Invoice No:</b> ${trip.id}</div>
      <div><b>Date:</b> ${trip.dateStr}</div>
      <div><b>Customer:</b> ${prof.name} (${prof.phone})</div>
      <div><b>Captain:</b> ${trip.captainName || 'Rajesh Patel'}</div>
      <div><b>Vehicle:</b> ${trip.vehicleIcon} ${trip.vehicleName}</div>
    </div>

    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px; font-size:11px; margin-bottom:12px;">
      <div style="margin-bottom:4px;"><b>Pickup:</b> ${trip.pickup}</div>
      <div><b>Drop:</b> ${trip.drop}</div>
      <div style="margin-top:4px; color:#64748B;">Total Distance: <b>${trip.distanceKm} km</b> • Duration: <b>${trip.durationMin} mins</b></div>
    </div>

    <div style="font-size:11.5px; border-top:1px solid #E2E8F0; padding-top:8px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span>Base Fare (first 1.5 km)</span>
        <span>₹${(trip.baseFare || 25).toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span>Distance Charge (${Math.max(0, trip.distanceKm - 1.5).toFixed(1)} km)</span>
        <span>₹${(trip.distCharge || 33).toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span>Platform Access Fee</span>
        <span>₹${(trip.platformFee || 3).toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span>GST @ 5%</span>
        <span>₹${(trip.gst || 3).toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:900; color:#042045; border-top:2px solid #0F172A; padding-top:8px; margin-top:6px;">
        <span>TOTAL PAID (${trip.paymentMethod})</span>
        <span>₹${trip.totalFare.toFixed(2)}</span>
      </div>
    </div>

    <div style="display:flex; gap:8px; margin-top:16px;">
      <button onclick="closeInvoiceModal()" style="flex:1; padding:9px; background:#F1F5F9; border:1px solid #CBD5E1; border-radius:8px; font-weight:bold; cursor:pointer;">Close</button>
      <button onclick="window.print()" style="flex:1; padding:9px; background:#006FD4; color:#FFF; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">🖨️ Print / PDF</button>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeInvoiceModal() {
  document.getElementById('custInvoiceModal')?.classList.add('hidden');
}

// ================= REAL-TIME GEOCODING, GPS & DISTANCE ENGINE =================
const LOCAL_GEO_DATABASE = [
  { name: 'SG Highway, Ahmedabad, Gujarat', lat: 23.0338, lon: 72.5085, landmark: 'Near ISKCON Temple & SBR' },
  { name: 'Vastrapur Lake, Ahmedabad, Gujarat', lat: 23.0375, lon: 72.5310, landmark: 'Amphitheatre & Alpha One Mall' },
  { name: 'Navrangpura, Ahmedabad, Gujarat', lat: 23.0365, lon: 72.5611, landmark: 'Commerce Six Roads' },
  { name: 'C.G. Road, Ahmedabad, Gujarat', lat: 23.0298, lon: 72.5574, landmark: 'Municipal Market' },
  { name: 'Prahlad Nagar, Ahmedabad, Gujarat', lat: 23.0125, lon: 72.5118, landmark: 'Garden & Corporate Road' },
  { name: 'Bopal, Ahmedabad, Gujarat', lat: 23.0330, lon: 72.4630, landmark: 'South Bopal & SP Ring Road' },
  { name: 'Sindhu Bhavan Road, Ahmedabad, Gujarat', lat: 23.0452, lon: 72.4988, landmark: 'Taj Skyline & Cafes' },
  { name: 'Maninagar, Ahmedabad, Gujarat', lat: 22.9978, lon: 72.6022, landmark: 'Kankaria Lake Front' },
  { name: 'Kalupur Railway Station, Ahmedabad, Gujarat', lat: 23.0233, lon: 72.6001, landmark: 'Central Railway Junction' },
  { name: 'Sardar Vallabhbhai Patel Airport, Ahmedabad, Gujarat', lat: 23.0734, lon: 72.6266, landmark: 'International Terminal 2' },
  { name: 'Science City, Ahmedabad, Gujarat', lat: 23.0782, lon: 72.4965, landmark: 'Aquatic Gallery & Robot Park' },
  { name: 'GIFT City, Gandhinagar, Gujarat', lat: 23.1610, lon: 72.6840, landmark: 'International Financial Tech City' },
  { name: 'Surat Railway Station, Surat, Gujarat', lat: 21.2049, lon: 72.8407, landmark: 'Surat Central' },
  { name: 'Athwalines, Surat, Gujarat', lat: 21.1762, lon: 72.8028, landmark: 'Chopati & Circuit House' },
  { name: 'Alkapuri, Vadodara, Gujarat', lat: 22.3107, lon: 73.1706, landmark: 'Railway Station West' },
  { name: 'Yagnik Road, Rajkot, Gujarat', lat: 22.2986, lon: 70.7963, landmark: 'Imperial Palace Area' },
  { name: 'Marine Drive, Mumbai, Maharashtra', lat: 18.9432, lon: 72.8230, landmark: 'Queens Necklace' },
  { name: 'Bandra West, Mumbai, Maharashtra', lat: 19.0596, lon: 72.8295, landmark: 'Linking Road & Hill Road' },
  { name: 'Connaught Place, New Delhi', lat: 28.6315, lon: 77.2167, landmark: 'Inner Circle & Metro' },
  { name: 'Koramangala, Bengaluru, Karnataka', lat: 12.9352, lon: 77.6245, landmark: 'Sony Signal 5th Block' }
];

let locationSearchDebounce = null;

function handleLocationInput(field, query) {
  checkServiceableLocations();
  const dropdownId = field === 'pickup' ? 'pickupResultsDropdown' : 'dropResultsDropdown';
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const q = (query || '').trim().toLowerCase();
  if (q.length < 2) {
    dropdown.classList.add('hidden');
    return;
  }

  // 1. Instant local match
  const localMatches = LOCAL_GEO_DATABASE.filter(item =>
    item.name.toLowerCase().includes(q) || (item.landmark && item.landmark.toLowerCase().includes(q))
  );

  renderDropdownResults(field, localMatches);

  // 2. Debounced Live OpenStreetMap Search
  clearTimeout(locationSearchDebounce);
  locationSearchDebounce = setTimeout(() => {
    fetchLiveNominatim(field, query);
  }, 400);
}

function fetchLiveNominatim(field, query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`;
  fetch(url, { headers: { 'Accept': 'application/json' } })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const liveItems = data.map(d => ({
          name: d.display_name.split(',').slice(0, 3).join(', '),
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          landmark: d.display_name.split(',').slice(2, 5).join(', ')
        }));
        renderDropdownResults(field, liveItems);
      }
    })
    .catch(err => {
      console.log('Online geocode fallback active:', err);
    });
}

function renderDropdownResults(field, items) {
  const dropdownId = field === 'pickup' ? 'pickupResultsDropdown' : 'dropResultsDropdown';
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  if (!items || items.length === 0) {
    dropdown.innerHTML = `<div style="padding:10px; font-size:11px; color:#64748B;">No matches found. Try area name or landmark.</div>`;
    dropdown.classList.remove('hidden');
    return;
  }

  dropdown.innerHTML = items.slice(0, 6).map(it => `
    <div class="loc-dropdown-item" onclick="selectLocationResult('${field}', '${it.name.replace(/'/g, "\\'")}', ${it.lat}, ${it.lon})">
      <span class="icon">📍</span>
      <div style="flex:1;">
        <b>${it.name}</b>
        <span class="sub">${it.landmark || 'Ahmedabad, Gujarat'}</span>
      </div>
    </div>
  `).join('');

  dropdown.classList.remove('hidden');
}

function selectLocationResult(field, name, lat, lon) {
  const input = document.getElementById(field === 'pickup' ? 'pickupAddr' : 'dropAddr');
  if (input) input.value = name;

  const dropdown = document.getElementById(field === 'pickup' ? 'pickupResultsDropdown' : 'dropResultsDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  if (field === 'pickup') {
    currentPickupCoords = { lat, lon, name };
    PICKUP_POS.label = name;
  } else {
    currentDropCoords = { lat, lon, name };
    DROP_POS.label = name;
  }

  recalculateDistanceAndRoute();
  checkServiceableLocations();
  updateFare();
  drawMap();
  drawCustMiniMap();
  setToast(`📍 Selected ${field.toUpperCase()}: ${name}`);
}

function recalculateDistanceAndRoute() {
  const dist = calcHaversineDistanceKm(
    currentPickupCoords.lat, currentPickupCoords.lon,
    currentDropCoords.lat, currentDropCoords.lon
  );
  currentTripDistanceKm = dist;
  currentTripDurationMin = Math.max(4, Math.round(dist * 2.4 + 2));

  const elKm = document.getElementById('displayTripKm');
  const elEta = document.getElementById('displayTripEta');
  if (elKm) elKm.innerText = `${currentTripDistanceKm.toFixed(1)} km`;
  if (elEta) elEta.innerText = `${currentTripDurationMin} mins`;
}

function calcHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = R * c;
  return Math.max(1.2, Math.round(rawDist * 10) / 10);
}

function useCurrentGpsLocation() {
  setToast('📡 Detecting current GPS location...');
  if (!navigator.geolocation) {
    applyFallbackGpsLocation();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(r => r.json())
        .then(data => {
          const name = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : 'Current GPS Location, Ahmedabad';
          selectLocationResult('pickup', name, lat, lon);
          setToast(`🎯 GPS Location detected: ${name}`);
        })
        .catch(() => {
          selectLocationResult('pickup', 'Current GPS Location, Ahmedabad', lat, lon);
          setToast(`🎯 GPS Location detected (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        });
    },
    (err) => {
      console.warn('Geolocation denied or unavailable:', err);
      applyFallbackGpsLocation();
    },
    { timeout: 6000 }
  );
}

function applyFallbackGpsLocation() {
  selectLocationResult('pickup', 'SG Highway, Ahmedabad, Gujarat', 23.0338, 72.5085);
  setToast('📍 Current GPS Location set: SG Highway, Ahmedabad (Pilot Hub)');
}

// Close location dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.loc-input-wrap')) {
    document.getElementById('pickupResultsDropdown')?.classList.add('hidden');
    document.getElementById('dropResultsDropdown')?.classList.add('hidden');
  }
});

// App Startup Initializations for Profile, Trips & Distance
renderCustomerProfile();
renderCustomerTrips('ALL');
recalculateDistanceAndRoute();
updateTripBadges();
