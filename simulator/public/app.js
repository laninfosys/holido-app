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

// Map Coordinates (Pixel based for 520x580 canvas)
const PICKUP_POS = { x: 130, y: 440, label: 'India Gate' };
const DROP_POS = { x: 390, y: 140, label: 'Connaught Place' };
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

  // Labels
  ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = '#AAA';
  ctx.fillText('India Gate (Pickup)', PICKUP_POS.x - 45, PICKUP_POS.y + 24);
  ctx.fillText('Connaught Place (Drop)', DROP_POS.x - 55, DROP_POS.y - 14);
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

  // Helper to calculate total for any vehicle
  function calcVehicleTotal(vType) {
    const v = VEHICLE_DATA[vType];
    const base = v.baseFare;
    const dist = Math.round(1.7 * v.perKmRate); // 3.2km trip (first 1.5km included in base, 1.7km chargeable)
    const surgeAmt = Math.round((base + dist) * (surgeMultiplier - 1.0));
    const subtotal = (base + dist) + surgeAmt;
    const gst = Math.round((subtotal + platformFee + convFee) * 0.05);
    const total = Math.round(subtotal + platformFee + convFee + gst);
    return { base, dist, surgeAmt, subtotal, gst, total, v };
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
    if (weight === 'CUSTOM_50_PLUS') {
      finalBase = 120 + Math.max(0, customKg - 50) * 2;
      finalDist = 20;
      weightLabel = `${customKg} kg (Commercial Freight)`;
      serviceName = `Holido Parcel ${catTitle} (${catIcon})`;
      serviceDesc = `Custom Heavy Freight (${customKg} kg) • Dedicated Two-Wheeler / Cargo`;
    } else if (weight === '20_TO_50KG' || weight === 'TWO_TO_FIVE_KG') {
      finalBase = 75;
      finalDist = 16;
      weightLabel = '20 kg to 50 kg';
      serviceName = `Holido Parcel ${catTitle} (${catIcon})`;
      serviceDesc = `Heavy Package (20 to 50 kg) • Safe Handling & Secure Strap`;
    } else {
      // UP_TO_20KG (or UP_TO_2KG)
      finalBase = 45;
      finalDist = 12;
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

  activeRide = {
    id: 'ride-' + Math.floor(Math.random() * 8999 + 1000),
    serviceType: currentService,
    vehicleType: isBike ? selectedVehicleType : 'PARCEL',
    vehicleObj: isBike ? selectedVeh : { name: `Parcel - ${parcelDetailsText}`, icon: '📦' },
    status: 'SEARCHING_CAPTAIN',
    otp: otp,
    fare: fareVal,
    earning: earningVal,
    payment: { ...selectedPaymentMethod },
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

// Listen for pricing changes from Admin Command Center
window.addEventListener('storage', (e) => {
  if (e.key === 'holido_pricing_config') {
    updateFare();
    setToast('⚡ Live Pricing & Surge updated from Super Admin Center!');
  }
});
