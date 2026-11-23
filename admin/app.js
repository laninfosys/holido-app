// Holido Admin Command Center - Real-Time Operations Script

let currentCaptainModalId = null;

const MOCK_CAPTAINS = [
  {
    id: 'CAP-101',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    category: 'BIKE',
    icon: '🏍️',
    vehicle: 'Hero Splendor Plus',
    plate: 'GJ 01 AB 4592',
    rating: '4.88 ★',
    todayEarnings: '₹840 (7 trips)',
    rawEarnings: 840,
    tripsCount: 1420,
    kyc: 'VERIFIED',
    status: 'ON TRIP',
    bloodGroup: 'B+',
    dlNumber: 'GJ-0120180094592',
    dlExpiry: '13-08-2036 (ACTIVE)',
    rcNumber: 'GJ 01 AB 4592',
    rcModel: 'HERO MOTOCORP - SPLENDOR PLUS BS-VI (AHMEDABAD RTO)',
    insurance: 'TATA AIG (Valid till 2028-11-20)',
    puc: 'PASS (Valid till 2027-05-10)',
    aadhar: 'XXXX - XXXX - 4592',
    address: 'Flat 402, Block C, Navrangpura, Ahmedabad, Gujarat',
    bankName: 'State Bank of India (SBI)',
    accountNo: 'XXXXXX8819',
    ifsc: 'SBIN0004210',
    upi: '9876543210@sbi',
    x: 240,
    y: 200,
    heading: 45
  },
  {
    id: 'CAP-102',
    name: 'Amit Kumar',
    phone: '+91 98111 22334',
    category: 'CAR',
    icon: '🚗',
    vehicle: 'Maruti Suzuki Dzire AC',
    plate: 'GJ 27 CZ 8812',
    rating: '4.92 ★',
    todayEarnings: '₹620 (5 trips)',
    rawEarnings: 620,
    tripsCount: 980,
    kyc: 'VERIFIED',
    status: 'ONLINE',
    bloodGroup: 'O+',
    dlNumber: 'GJ-2720190038812',
    dlExpiry: '22-04-2038 (ACTIVE)',
    rcNumber: 'GJ 27 CZ 8812',
    rcModel: 'MARUTI SUZUKI - DZIRE VXI (AHMEDABAD EAST RTO)',
    insurance: 'ICICI LOMBARD (Valid till 2029-02-14)',
    puc: 'PASS (Valid till 2027-08-19)',
    aadhar: 'XXXX - XXXX - 8812',
    address: 'H-12, SG Highway, Vastrapur, Ahmedabad, Gujarat',
    bankName: 'HDFC Bank',
    accountNo: 'XXXXXX4421',
    ifsc: 'HDFC0001204',
    upi: 'amit.activa@hdfcbank',
    x: 420,
    y: 140,
    heading: 120
  },
  {
    id: 'CAP-103',
    name: 'Vikram Singh',
    phone: '+91 97222 33445',
    category: 'BIKE',
    icon: '🏍️',
    vehicle: 'Bajaj Pulsar 150',
    plate: 'GJ 01 BK 1109',
    rating: '4.75 ★',
    todayEarnings: '₹1,150 (9 trips)',
    rawEarnings: 1150,
    tripsCount: 2150,
    kyc: 'VERIFIED',
    status: 'ON TRIP',
    bloodGroup: 'A+',
    dlNumber: 'GJ-0120160011109',
    dlExpiry: '11-10-2034 (ACTIVE)',
    rcNumber: 'GJ 01 BK 1109',
    rcModel: 'BAJAJ AUTO - PULSAR 150 (AHMEDABAD RTO)',
    insurance: 'BAJAJ ALLIANZ (Valid till 2027-12-05)',
    puc: 'PASS (Valid till 2027-02-28)',
    aadhar: 'XXXX - XXXX - 1109',
    address: 'B-34, Maninagar East, Ahmedabad, Gujarat',
    bankName: 'Punjab National Bank (PNB)',
    accountNo: 'XXXXXX9902',
    ifsc: 'PUNB0140200',
    upi: 'vikram.singh@pnb',
    x: 180,
    y: 310,
    heading: 270
  },
  {
    id: 'CAP-104',
    name: 'Suresh Patel',
    phone: '+91 99333 44556',
    category: 'AUTO',
    icon: '🛺',
    vehicle: 'Bajaj RE Compact Auto',
    plate: 'GJ 01 DL 2045',
    rating: '4.81 ★',
    todayEarnings: '₹450 (4 trips)',
    rawEarnings: 450,
    tripsCount: 640,
    kyc: 'PENDING RC',
    status: 'ONLINE',
    bloodGroup: 'AB+',
    dlNumber: 'GJ-0120200012045',
    dlExpiry: '04-09-2041 (ACTIVE)',
    rcNumber: 'GJ 01 DL 2045',
    rcModel: 'BAJAJ AUTO - RE COMPACT (AHMEDABAD RTO)',
    insurance: 'DIGIT INSURANCE (Pending Verification)',
    puc: 'PASS (Valid till 2026-12-30)',
    aadhar: 'XXXX - XXXX - 6721',
    address: 'B-10, Prahlad Nagar, Satellite, Ahmedabad, Gujarat',
    address: 'Shop 4, Sector 18 Market, Noida, UP',
    bankName: 'Axis Bank',
    accountNo: 'XXXXXX3310',
    ifsc: 'UTIB0000840',
    upi: 'sureshpatel@axisbank',
    x: 520,
    y: 260,
    heading: 180
  }
];

const MOCK_TRIPS = [
  {
    id: 'HLD-9821',
    service: 'BIKE TAXI',
    customerName: 'Akshay Kumar',
    customerPhone: '+91 98765 11111',
    route: 'India Gate → Connaught Place',
    fare: '₹35',
    captain: 'Rahul Sharma (Hero Splendor)',
    otp: '4829 (Verified)',
    status: 'IN_PROGRESS'
  },
  {
    id: 'HLD-9820',
    service: 'PARCEL EXPRESS',
    customerName: 'Pooja Verma',
    customerPhone: '+91 98111 22222',
    route: 'Khan Market → Sector 18 Noida',
    fare: '₹65',
    captain: 'Vikram Singh (Bajaj Pulsar)',
    otp: '9142 (Verified)',
    status: 'IN_PROGRESS'
  },
  {
    id: 'HLD-9819',
    service: 'BIKE TAXI',
    customerName: 'Rohan Mehra',
    customerPhone: '+91 97222 33333',
    route: 'Lajpat Nagar → South Extension',
    fare: '₹28',
    captain: 'Amit Kumar (Honda Activa)',
    otp: '1094 (Pending)',
    status: 'ASSIGNED'
  }
];

// Canvas Radar
const canvas = document.getElementById('adminRadarCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let radarAngle = 0;

function drawRadar() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background grid
  ctx.fillStyle = '#050C1A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = '#0F2344';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Major highway roads
  ctx.strokeStyle = '#162C52';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(80, 340);
  ctx.lineTo(240, 200);
  ctx.lineTo(460, 120);
  ctx.lineTo(650, 100);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(180, 60);
  ctx.lineTo(340, 240);
  ctx.lineTo(540, 320);
  ctx.stroke();

  // Active trip routes
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 4;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(140, 260);
  ctx.lineTo(240, 200);
  ctx.lineTo(380, 150);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw Captains
  MOCK_CAPTAINS.forEach((cap) => {
    ctx.fillStyle = cap.status === 'ON TRIP' ? 'rgba(255, 129, 0, 0.35)' : 'rgba(0, 111, 212, 0.25)';
    ctx.beginPath();
    ctx.arc(cap.x, cap.y, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cap.status === 'ON TRIP' ? '#FF8100' : '#006FD4';
    ctx.beginPath();
    ctx.arc(cap.x, cap.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${cap.name} (${cap.status})`, cap.x - 25, cap.y - 12);
  });

  // Radar sweep
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  radarAngle += 0.015;
  const rx = cx + Math.cos(radarAngle) * 300;
  const ry = cy + Math.sin(radarAngle) * 300;

  const grad = ctx.createLinearGradient(cx, cy, rx, ry);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(rx, ry);
  ctx.stroke();

  requestAnimationFrame(drawRadar);
}

// Populate Trips Table
function renderTrips() {
  const bodies = [
    document.getElementById('tripsTableBody'),
    document.getElementById('fullTripsTableBody')
  ].filter(Boolean);

  bodies.forEach(tbody => {
    tbody.innerHTML = '';
    MOCK_TRIPS.forEach((trip) => {
      const tr = document.createElement('tr');
      tr.className = 'clickable-row';
      tr.innerHTML = `
        <td><b>${trip.id}</b></td>
        <td><span class="badge-service">${trip.service}</span></td>
        <td>
          <span onclick="openCustomerModal('${trip.id}')" style="color:#60A5FA; cursor:pointer; text-decoration:underline">
            <b>${trip.customerName}</b>
          </span><br>
          <small style="color:#94A3B8">${trip.customerPhone}</small>
        </td>
        <td>${trip.route}</td>
        <td><b style="color:#38BDF8">${trip.fare}</b></td>
        <td>${trip.captain}</td>
        <td><span style="color:${trip.otp.includes('Verified') ? '#34D399' : '#FBBF24'}">${trip.otp}</span></td>
        <td><span class="badge-status ${trip.status === 'IN_PROGRESS' ? 'in-progress' : 'assigned'}">${trip.status}</span></td>
        <td>
          <button class="btn-table-action" onclick="openCustomerModal('${trip.id}')">👤 View User</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// Populate Captains Table
function renderCaptains() {
  const bodies = [
    document.getElementById('captainsTableBody'),
    document.getElementById('fullCaptainsTableBody')
  ].filter(Boolean);

  bodies.forEach(tbody => {
    tbody.innerHTML = '';
    MOCK_CAPTAINS.forEach((cap) => {
      const tr = document.createElement('tr');
      tr.className = 'clickable-row';
      tr.innerHTML = `
        <td><b>${cap.id}</b></td>
        <td>
          <span onclick="openCaptainModal('${cap.id}')" style="color:#60A5FA; cursor:pointer; text-decoration:underline">
            <b>${cap.name}</b>
          </span><br>
          <small style="color:#94A3B8">${cap.phone}</small>
        </td>
        <td>
          <span class="badge-status ${cap.category === 'CAR' ? 'verified' : (cap.category === 'AUTO' ? 'assigned' : 'in-progress')}" style="font-size:10px; padding:2px 7px; margin-right:4px;">
            ${cap.icon || '🏍️'} ${cap.category || 'BIKE'}
          </span>
          <b>${cap.vehicle}</b><br>
          <small style="color:#64748B; font-family:monospace; font-size:10.5px;">${cap.plate}</small>
        </td>
        <td style="color:#FBBF24; font-weight:bold">${cap.rating}</td>
        <td style="color:#34D399; font-weight:bold">${cap.todayEarnings}</td>
        <td>
          <span class="badge-status ${cap.kyc === 'VERIFIED' ? 'verified' : 'pending'}">${cap.kyc}</span>
        </td>
        <td>
          <span class="badge-status ${cap.status === 'ON TRIP' ? 'in-progress' : 'verified'}">${cap.status}</span>
        </td>
        <td>
          <button class="btn-table-action" onclick="openCaptainModal('${cap.id}')">
            🪪 Audit Documents
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// OPEN CAPTAIN KYC & DOCUMENT MODAL
function openCaptainModal(id) {
  const cap = MOCK_CAPTAINS.find((c) => c.id === id);
  if (!cap) return;

  currentCaptainModalId = id;

  // Header & Strip Info
  document.getElementById('modalCapName').innerText = `${cap.name} (${cap.id})`;
  document.getElementById('stripName').innerText = cap.name;
  document.getElementById('stripPhone').innerText = cap.phone;
  document.getElementById('stripRating').innerText = `${cap.rating} (${cap.tripsCount} trips)`;
  document.getElementById('stripVehicle').innerText = `${cap.vehicle} (${cap.plate})`;
  document.getElementById('stripKycBadge').innerText = cap.kyc;
  document.getElementById('stripKycBadge').className = `badge-status ${cap.kyc === 'VERIFIED' ? 'verified' : 'pending'}`;
  document.getElementById('stripStatus').innerText = cap.status;

  // Driving License Details
  document.getElementById('dlNumber').innerText = cap.dlNumber;
  document.getElementById('dlHolderName').innerText = cap.name.toUpperCase();

  // Vehicle RC Details
  document.getElementById('rcNumber').innerText = cap.rcNumber;
  document.getElementById('rcOwner').innerText = cap.name.toUpperCase();
  document.getElementById('rcModel').innerText = cap.rcModel;

  // Aadhaar Details
  document.getElementById('aadharName').innerText = cap.name;

  // Bank & Payout Details
  document.getElementById('bankHolder').innerText = cap.name;
  document.getElementById('bankUpi').innerText = cap.upi;
  document.getElementById('modalCapEarnings').innerText = `₹${cap.rawEarnings}.00`;

  // Reset to first tab (DL)
  switchDocTab('dl');

  // Show Modal
  document.getElementById('kycModal').classList.remove('hidden');
}

// OPEN CUSTOMER PROFILE MODAL
function openCustomerModal(tripId) {
  const trip = MOCK_TRIPS.find((t) => t.id === tripId) || MOCK_TRIPS[0];

  document.getElementById('modalCustName').innerText = trip.customerName;
  document.getElementById('custProfileName').innerText = trip.customerName;
  document.getElementById('custProfilePhone').innerText = trip.customerPhone;

  document.getElementById('userModal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function onBackdropClick(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

// Switch Document Tabs inside Captain Modal
function switchDocTab(tab) {
  const views = ['dl', 'rc', 'aadhar', 'bank'];
  views.forEach((v) => {
    const panel = document.getElementById(`docView${v.charAt(0).toUpperCase() + v.slice(1)}`);
    const btn = document.getElementById(`tab${v.charAt(0).toUpperCase() + v.slice(1)}`);
    if (panel) panel.classList.toggle('hidden', v !== tab);
    if (btn) btn.classList.toggle('active', v === tab);
  });
}

// Captain Audit Actions
function approveCaptainKyc() {
  if (!currentCaptainModalId) return;
  const cap = MOCK_CAPTAINS.find((c) => c.id === currentCaptainModalId);
  if (cap) {
    cap.kyc = 'VERIFIED';
    document.getElementById('stripKycBadge').innerText = 'VERIFIED';
    document.getElementById('stripKycBadge').className = 'badge-status verified';
    renderCaptains();
    alert(`🎉 SUCCESS: All documents for ${cap.name} approved!\n\n- Driving License (DL): Verified with Sarathi\n- Vehicle RC: Verified with VAHAN 4.0\n- Aadhaar: DigiLocker Authenticated\n- Bank Account: Penny-drop Confirmed`);
  }
}

function suspendCaptain() {
  if (!currentCaptainModalId) return;
  const cap = MOCK_CAPTAINS.find((c) => c.id === currentCaptainModalId);
  if (cap) {
    const confirmAction = confirm(`Are you sure you want to suspend Captain ${cap.name}? They will immediately be logged out and cannot receive rides.`);
    if (confirmAction) {
      cap.status = 'SUSPENDED';
      cap.kyc = 'SUSPENDED';
      closeModal('kycModal');
      renderCaptains();
      alert(`⚠️ Captain ${cap.name} has been suspended.`);
    }
  }
}

function requestDocReupload() {
  if (!currentCaptainModalId) return;
  const cap = MOCK_CAPTAINS.find((c) => c.id === currentCaptainModalId);
  if (cap) {
    alert(`SMS & Push Notification sent to ${cap.name} (+${cap.phone}):\n"Holido Admin: Your Vehicle RC photo was blurry. Please re-upload clear photos via Holido Captain App."`);
  }
}

function updateBaseFare(val) {
  const el = document.getElementById('valBaseFare');
  if (el) el.innerText = `₹${val}`;
}

function updateKmRate(val) {
  const el = document.getElementById('valKmRate');
  if (el) el.innerText = `₹${val}/km`;
}

function updateCommission(val) {
  const el = document.getElementById('valCommission');
  if (el) el.innerText = `${val}%`;
}

// SIDEBAR NAVIGATION SWITCHER
function switchNavTab(tabName) {
  try {
    const tabs = ['overview', 'trips', 'captains', 'rider-payments', 'pricing', 'locations', 'revenue', 'payment', 'team', 'logs', 'reviews', 'profile'];

    tabs.forEach((tab) => {
      const navBtn = document.getElementById(`nav-${tab}`);
      const viewSection = document.getElementById(`view-${tab}`);

      if (navBtn) {
        navBtn.classList.toggle('active', tab === tabName);
      }
      if (viewSection) {
        viewSection.classList.toggle('hidden', tab !== tabName);
      }
    });

    // Re-render data tables when tab changes
    if (tabName === 'trips' || tabName === 'overview') {
      try { renderTrips(); } catch (e) { console.warn('renderTrips error:', e); }
    }
    if (tabName === 'captains' || tabName === 'overview') {
      try { renderCaptains(); } catch (e) { console.warn('renderCaptains error:', e); }
    }
    if (tabName === 'rider-payments' || tabName === 'revenue') {
      try { renderRiderPaymentsTable(); } catch (e) { console.warn('renderRiderPaymentsTable error:', e); }
    }
    if (tabName === 'pricing') {
      try { loadAdminPricingConfig(); } catch (e) { console.warn('loadAdminPricingConfig error:', e); }
    }
    if (tabName === 'locations') {
      try { renderCityLocationsTable(); } catch (e) { console.warn('renderCityLocationsTable error:', e); }
    }
    if (tabName === 'team') {
      try { renderTeamTable(); } catch (e) { console.warn('renderTeamTable error:', e); }
    }
    if (tabName === 'logs') {
      try { renderAuditLogs(); } catch (e) { console.warn('renderAuditLogs error:', e); }
    }
    if (tabName === 'reviews') {
      try { renderReviewsTable(); } catch (e) { console.warn('renderReviewsTable error:', e); }
    }
    if (tabName === 'profile') {
      try { updateProfileView(); } catch (e) { console.warn('updateProfileView error:', e); }
    }
  } catch (err) {
    console.error('switchNavTab error:', err);
  }
}

// PAYMENT GATEWAY PROVIDER CONTROLS
let activePg = 'RAZORPAY';

function selectPgProvider(provider) {
  activePg = provider;
  const cards = ['Razorpay', 'Cashfree', 'Phonepe'];
  cards.forEach((c) => {
    const el = document.getElementById(`card${c}`);
    if (el) {
      el.classList.toggle('active', c.toUpperCase() === provider);
    }
  });
}

function savePaymentConfig() {
  const keyId = document.getElementById('rzpKeyId').value;
  const env = document.getElementById('pgEnvMode').value;
  alert(`✅ PAYMENT GATEWAY SAVED!\n\n- Active Gateway: ${activePg}\n- Environment: ${env}\n- Key ID: ${keyId}\n- Daily Auto-Payouts: Enabled\n\nAll mobile apps now route payments through this gateway configuration.`);
}

function testGatewayConnection() {
  const env = document.getElementById('pgEnvMode').value;
  alert(`⚡ TESTING GATEWAY CONNECTION...\n\nConnecting to Razorpay API Server (${env})...\n\nStatus: 200 OK (Connection Live)\nLatency: 64ms\nUPI Intent & AutoPay: ACTIVE\nWebhooks: ACTIVE\n\nGateway is 100% operational!`);
}

// SUB-TABLE TOGGLE INSIDE OVERVIEW
function showSubTable(tab) {
  const tripsPanel = document.getElementById('sectionTrips');
  const captainsPanel = document.getElementById('sectionCaptains');
  const tabTrips = document.getElementById('tabLiveTrips');
  const tabCaptains = document.getElementById('tabCaptains');

  if (tab === 'trips') {
    tripsPanel.classList.remove('hidden');
    captainsPanel.classList.add('hidden');
    tabTrips.classList.add('active');
    tabCaptains.classList.remove('active');
    renderTrips();
  } else {
    tripsPanel.classList.add('hidden');
    captainsPanel.classList.remove('hidden');
    tabTrips.classList.remove('active');
    tabCaptains.classList.add('active');
    renderCaptains();
  }
}

// ================= CENTRAL PRICING, PLATFORM FEES & GEO-HEX ZONES =================

let ADMIN_PRICING_CONFIG = {
  platformFee: 3.00,
  activeSurgeMultiplier: 1.0,
  selectedGeoZone: 'H3-DL01',
  geoHexZones: [
    { id: 'H3-DL01', name: 'Connaught Place & Central Hub', landmark: 'Inner Circle, Barakhamba', demand: 'PEAK', multiplier: 1.5, active: true },
    { id: 'H3-DL02', name: 'Cyber City & DLF Hub, Gurugram', landmark: 'DLF Phase 2, Rapid Metro', demand: 'CRITICAL', multiplier: 1.8, active: true },
    { id: 'H3-DL03', name: 'IGI Airport & Aerocity T3', landmark: 'Terminal 3 & Aerocity Hub', demand: 'HIGH', multiplier: 1.4, active: true },
    { id: 'H3-DL04', name: 'Noida Sector 62 & Tech Park', landmark: 'Electronic City, NH-24', demand: 'MODERATE', multiplier: 1.2, active: true },
    { id: 'H3-DL05', name: 'South Extension & AIIMS', landmark: 'Ring Road, Medical Hub', demand: 'NORMAL', multiplier: 1.0, active: false }
  ],
  paymentConvenienceFees: {
    CASH: 0.00,
    UPI: 0.00,
    WALLET: 0.00,
    DEBIT_CARD: 3.00,
    CREDIT_CARD: 8.00,
    NETBANKING: 5.00
  },
  vehicleBaseFares: {
    BIKE: 25.0,
    AUTO: 35.0,
    CAR: 60.0
  },
  vehicleKmRates: {
    BIKE: 10.0,
    AUTO: 14.0,
    CAR: 18.0
  }
};

function loadAdminPricingConfig() {
  try {
    const raw = localStorage.getItem('holido_pricing_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      ADMIN_PRICING_CONFIG = {
        ...ADMIN_PRICING_CONFIG,
        ...parsed,
        paymentConvenienceFees: {
          ...ADMIN_PRICING_CONFIG.paymentConvenienceFees,
          ...(parsed.paymentConvenienceFees || {})
        }
      };
    }
  } catch (e) {
    console.warn('Error reading config from storage:', e);
  }

  // Populate Platform Fee UI
  const platSlider = document.getElementById('adminPlatformSlider');
  const platDisplay = document.getElementById('adminPlatformFeeDisplay');
  const platBadge = document.getElementById('adminPlatformBadge');
  const feeVal = ADMIN_PRICING_CONFIG.platformFee !== undefined ? ADMIN_PRICING_CONFIG.platformFee : 3.00;
  if (platSlider) platSlider.value = feeVal;
  if (platDisplay) platDisplay.innerText = `₹${feeVal.toFixed(2)}`;
  if (platBadge) platBadge.innerText = `CURRENT: ₹${feeVal.toFixed(2)}`;

  // Populate Payment Convenience Fees UI
  if (ADMIN_PRICING_CONFIG.paymentConvenienceFees) {
    ['CASH', 'UPI', 'WALLET', 'DEBIT_CARD', 'CREDIT_CARD', 'NETBANKING'].forEach(key => {
      const input = document.getElementById(`adminFee_${key}`);
      if (input && ADMIN_PRICING_CONFIG.paymentConvenienceFees[key] !== undefined) {
        input.value = ADMIN_PRICING_CONFIG.paymentConvenienceFees[key].toFixed(2);
      }
    });
  }

  // Populate Vehicle Fares
  if (ADMIN_PRICING_CONFIG.vehicleBaseFares) {
    const b1 = document.getElementById('viewBaseFare');
    const b2 = document.getElementById('viewAutoBase');
    const b3 = document.getElementById('viewCarBase');
    if (b1) b1.innerText = `₹${ADMIN_PRICING_CONFIG.vehicleBaseFares.BIKE}`;
    if (b2) b2.innerText = `₹${ADMIN_PRICING_CONFIG.vehicleBaseFares.AUTO}`;
    if (b3) b3.innerText = `₹${ADMIN_PRICING_CONFIG.vehicleBaseFares.CAR}`;
  }

  // Render Geo-Hex Zones Table
  renderGeoHexZonesTable();
}

function syncPricingConfigToStorage() {
  localStorage.setItem('holido_pricing_config', JSON.stringify(ADMIN_PRICING_CONFIG));
}

// SUB-NAVIGATION TABS INSIDE PRICING VIEW
function switchPricingSubTab(tab) {
  const tabs = ['surge', 'vehicles', 'dailypass', 'convenience'];
  tabs.forEach(t => {
    const btn = document.getElementById(`ptab-${t}`);
    const panel = document.getElementById(`subview-${t}`);
    if (btn) btn.classList.toggle('active', t === tab);
    if (panel) panel.classList.toggle('hidden', t !== tab);
  });
}

// 1. GEO-HEX DEMAND ZONES TABLE RENDERER (FULL CRUD: CREATE, EDIT, DELETE)
function renderGeoHexZonesTable() {
  const tbody = document.getElementById('geoHexZonesTableBody');
  if (!tbody) return;

  const countBadge = document.getElementById('zoneCountBadge');
  if (countBadge) {
    countBadge.innerText = `${ADMIN_PRICING_CONFIG.geoHexZones.length} ZONES CONFIGURED`;
  }

  tbody.innerHTML = '';
  ADMIN_PRICING_CONFIG.geoHexZones.forEach(z => {
    const tr = document.createElement('tr');
    const demandBadgeClass = z.demand === 'CRITICAL' ? 'assigned' : (z.demand === 'PEAK' ? 'assigned' : (z.demand === 'HIGH' ? 'in-progress' : 'verified'));
    
    tr.innerHTML = `
      <td><span style="font-family:monospace; color:#006FD4; font-weight:800; font-size:12.5px;">${z.id}</span></td>
      <td>
        <b style="color:#0F172A; font-size:13px;">${z.name}</b><br>
        <small style="color:#64748B;">📍 ${z.landmark}</small>
      </td>
      <td>
        <span class="badge-status ${demandBadgeClass}" style="font-size:10px;">${z.demand}</span>
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="number" min="1.0" max="3.5" step="0.1" value="${z.multiplier.toFixed(1)}" 
            id="inputMult_${z.id}"
            onchange="onZoneMultiplierChange('${z.id}', this.value)"
            style="width:68px; padding:5px 8px; border:1px solid #CBD5E1; border-radius:6px; font-weight:bold; font-size:13px; text-align:center;">
          <b style="color:${z.multiplier > 1.0 ? '#FF8100' : '#059669'}; font-size:13px;" id="badgeMult_${z.id}">${z.multiplier.toFixed(1)}x</b>
        </div>
      </td>
      <td>
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
          <input type="checkbox" ${z.active ? 'checked' : ''} onchange="toggleZoneSurge('${z.id}', this.checked)" style="width:16px; height:16px; accent-color:#006FD4;">
          <span style="font-size:11px; font-weight:bold; color:${z.active ? '#006FD4' : '#64748B'};">${z.active ? 'SURGE ACTIVE' : 'STANDARD'}</span>
        </label>
      </td>
      <td>
        <div style="display:flex; gap:4px;">
          <button class="btn-table-action" onclick="setZonePreset('${z.id}', 1.0)" style="padding:3px 6px; font-size:10px;">1.0x</button>
          <button class="btn-table-action" onclick="setZonePreset('${z.id}', 1.3)" style="padding:3px 6px; font-size:10px;">1.3x</button>
          <button class="btn-table-action" onclick="setZonePreset('${z.id}', 1.5)" style="padding:3px 6px; font-size:10px; background:#EFF6FF; color:#006FD4;">1.5x</button>
          <button class="btn-table-action" onclick="setZonePreset('${z.id}', 1.8)" style="padding:3px 6px; font-size:10px; background:#FEF3C7; color:#D97706;">1.8x</button>
          <button class="btn-table-action" onclick="setZonePreset('${z.id}', 2.0)" style="padding:3px 6px; font-size:10px; background:#FEE2E2; color:#DC2626;">2.0x</button>
        </div>
      </td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; gap:6px;">
          <button class="btn-action-edit" onclick="openEditZoneModal('${z.id}')" title="Edit Zone Details & Multiplier">
            ✏️ Edit
          </button>
          <button class="btn-action-delete" onclick="deleteZone('${z.id}')" title="Delete Zone">
            🗑️ Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ================= GEO-HEX CRUD MODAL CONTROLS =================

function openCreateZoneModal() {
  document.getElementById('geoEditMode').value = 'CREATE';
  document.getElementById('geoOriginalId').value = '';
  document.getElementById('geoModalBadge').innerText = 'NEW DEMAND REGION';
  document.getElementById('geoModalTitle').innerText = 'Create New Geo-Hex Demand Zone';

  // Suggest next ID
  const nextNum = ADMIN_PRICING_CONFIG.geoHexZones.length + 1;
  const suggestedId = `H3-DL0${nextNum}`;
  document.getElementById('geoInputId').value = suggestedId;
  document.getElementById('geoInputId').readOnly = false;
  document.getElementById('geoInputName').value = '';
  document.getElementById('geoInputLandmark').value = '';
  document.getElementById('geoSelectDemand').value = 'HIGH';
  document.getElementById('geoInputMultiplier').value = '1.5';
  document.getElementById('geoCheckActive').checked = true;

  document.getElementById('geoHexModal').classList.remove('hidden');
}

function openEditZoneModal(zoneId) {
  const z = ADMIN_PRICING_CONFIG.geoHexZones.find(x => x.id === zoneId);
  if (!z) return;

  document.getElementById('geoEditMode').value = 'EDIT';
  document.getElementById('geoOriginalId').value = z.id;
  document.getElementById('geoModalBadge').innerText = `EDITING ZONE: ${z.id}`;
  document.getElementById('geoModalTitle').innerText = `Edit Demand Zone: ${z.name}`;

  document.getElementById('geoInputId').value = z.id;
  document.getElementById('geoInputId').readOnly = true; // Primary ID locked on edit
  document.getElementById('geoInputName').value = z.name;
  document.getElementById('geoInputLandmark').value = z.landmark || '';
  document.getElementById('geoSelectDemand').value = z.demand || 'HIGH';
  document.getElementById('geoInputMultiplier').value = z.multiplier.toFixed(1);
  document.getElementById('geoCheckActive').checked = !!z.active;

  document.getElementById('geoHexModal').classList.remove('hidden');
}

function saveGeoHexZoneModal() {
  const mode = document.getElementById('geoEditMode').value;
  const originalId = document.getElementById('geoOriginalId').value;
  const zoneId = document.getElementById('geoInputId').value.trim().toUpperCase();
  const name = document.getElementById('geoInputName').value.trim();
  const landmark = document.getElementById('geoInputLandmark').value.trim();
  const demand = document.getElementById('geoSelectDemand').value;
  const multiplier = parseFloat(document.getElementById('geoInputMultiplier').value) || 1.0;
  const active = document.getElementById('geoCheckActive').checked;

  if (!zoneId || !name) {
    alert('Please enter both Zone ID (e.g. H3-DL06) and Zone Name.');
    return;
  }

  if (mode === 'CREATE') {
    // Check if ID already exists
    if (ADMIN_PRICING_CONFIG.geoHexZones.some(x => x.id === zoneId)) {
      alert(`Zone ID "${zoneId}" already exists. Please use a unique Zone ID.`);
      return;
    }

    ADMIN_PRICING_CONFIG.geoHexZones.push({
      id: zoneId,
      name: name,
      landmark: landmark || name,
      demand: demand,
      multiplier: multiplier,
      active: active
    });

    MOCK_AUDIT_LOGS.unshift({
      id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
      entity: 'ADMIN',
      actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
      action: 'GEO_ZONE_CREATED',
      details: `Created new Geo-Hex demand zone "${name}" (${zoneId}) with multiplier ${multiplier}x`,
      severity: 'SUCCESS'
    });
  } else {
    // EDIT
    const z = ADMIN_PRICING_CONFIG.geoHexZones.find(x => x.id === originalId);
    if (z) {
      z.name = name;
      z.landmark = landmark;
      z.demand = demand;
      z.multiplier = multiplier;
      z.active = active;

      MOCK_AUDIT_LOGS.unshift({
        id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: 'Just now',
        entity: 'ADMIN',
        actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
        action: 'GEO_ZONE_EDITED',
        details: `Updated Geo-Hex demand zone "${name}" (${zoneId}) - Multiplier: ${multiplier}x, Demand: ${demand}`,
        severity: 'MEDIUM'
      });
    }
  }

  closeModal('geoHexModal');
  renderGeoHexZonesTable();
  renderAuditLogs();
  syncPricingConfigToStorage();

  alert(`✅ Geo-Hex Demand Zone "${name}" (${zoneId}) saved successfully!\n\nDemand multiplier: ${multiplier}x\nStatus: ${active ? 'Active' : 'Standard'}`);
}

function deleteZone(zoneId) {
  const z = ADMIN_PRICING_CONFIG.geoHexZones.find(x => x.id === zoneId);
  if (!z) return;

  const confirmDelete = confirm(`⚠️ DELETE CONFIRMATION:\n\nAre you sure you want to delete Geo-Hex Demand Zone:\n"${z.name}" (${z.id})?\n\nThis will remove the demand surge configuration for this region.`);
  if (confirmDelete) {
    ADMIN_PRICING_CONFIG.geoHexZones = ADMIN_PRICING_CONFIG.geoHexZones.filter(x => x.id !== zoneId);

    MOCK_AUDIT_LOGS.unshift({
      id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
      entity: 'ADMIN',
      actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
      action: 'GEO_ZONE_DELETED',
      details: `Deleted Geo-Hex demand zone "${z.name}" (${z.id})`,
      severity: 'WARNING'
    });

    renderGeoHexZonesTable();
    renderAuditLogs();
    syncPricingConfigToStorage();

    alert(`🗑️ Geo-Hex Zone "${z.name}" (${z.id}) deleted successfully.`);
  }
}

function onZoneMultiplierChange(zoneId, val) {
  const mult = parseFloat(val) || 1.0;
  const z = ADMIN_PRICING_CONFIG.geoHexZones.find(x => x.id === zoneId);
  if (z) {
    z.multiplier = mult;
    z.active = mult > 1.0;
    const badge = document.getElementById(`badgeMult_${zoneId}`);
    if (badge) {
      badge.innerText = `${mult.toFixed(1)}x`;
      badge.style.color = mult > 1.0 ? '#FF8100' : '#059669';
    }
  }
}

function toggleZoneSurge(zoneId, isChecked) {
  const z = ADMIN_PRICING_CONFIG.geoHexZones.find(x => x.id === zoneId);
  if (z) {
    z.active = isChecked;
    if (!isChecked) {
      z.multiplier = 1.0;
      const inp = document.getElementById(`inputMult_${zoneId}`);
      const badge = document.getElementById(`badgeMult_${zoneId}`);
      if (inp) inp.value = '1.0';
      if (badge) {
        badge.innerText = '1.0x';
        badge.style.color = '#059669';
      }
    }
  }
}

function setZonePreset(zoneId, multiplier) {
  const z = ADMIN_PRICING_CONFIG.geoHexZones.find(x => x.id === zoneId);
  if (z) {
    z.multiplier = multiplier;
    z.active = multiplier > 1.0;
    const inp = document.getElementById(`inputMult_${zoneId}`);
    const badge = document.getElementById(`badgeMult_${zoneId}`);
    if (inp) inp.value = multiplier.toFixed(1);
    if (badge) {
      badge.innerText = `${multiplier.toFixed(1)}x`;
      badge.style.color = multiplier > 1.0 ? '#FF8100' : '#059669';
    }
  }
}

function resetSurgeZonesDefault() {
  ADMIN_PRICING_CONFIG.geoHexZones.forEach(z => {
    z.multiplier = 1.0;
    z.active = false;
  });
  renderGeoHexZonesTable();
  syncPricingConfigToStorage();
  alert('↺ All Geo-Hex zones have been reset to Normal Demand (1.0x multiplier).');
}

function saveGeoHexZones() {
  syncPricingConfigToStorage();

  MOCK_AUDIT_LOGS.unshift({
    id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: 'Just now',
    entity: 'ADMIN',
    actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
    action: 'GEO_HEX_SURGE_SAVED',
    details: `Updated Delhi NCR Geo-Hex demand surge zones (Connaught Place: ${ADMIN_PRICING_CONFIG.geoHexZones[0].multiplier}x, Cyber City: ${ADMIN_PRICING_CONFIG.geoHexZones[1].multiplier}x)`,
    severity: 'HIGH'
  });
  renderAuditLogs();

  alert('⚡ GEO-HEX SURGE ZONES BROADCASTED SUCCESSFULLY!\n\n• Connaught Place: ' + ADMIN_PRICING_CONFIG.geoHexZones[0].multiplier + 'x\n• Cyber City DLF: ' + ADMIN_PRICING_CONFIG.geoHexZones[1].multiplier + 'x\n• IGI Airport Aerocity: ' + ADMIN_PRICING_CONFIG.geoHexZones[2].multiplier + 'x\n\nNew surge rates are instantly propagated to the Customer App fare preview and Captain dispatch engine.');
}

// 2. PLATFORM ACCESS FEE MANAGEMENT
function onPlatformFeeSlider(val) {
  const num = parseFloat(val);
  const disp = document.getElementById('adminPlatformFeeDisplay');
  if (disp) disp.innerText = `₹${num.toFixed(2)}`;
}

function savePlatformAccessFee() {
  const slider = document.getElementById('adminPlatformSlider');
  const val = slider ? parseFloat(slider.value) : 3.00;
  ADMIN_PRICING_CONFIG.platformFee = val;

  const badge = document.getElementById('adminPlatformBadge');
  if (badge) badge.innerText = `CURRENT: ₹${val.toFixed(2)}`;

  syncPricingConfigToStorage();

  MOCK_AUDIT_LOGS.unshift({
    id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: 'Just now',
    entity: 'ADMIN',
    actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
    action: 'UPDATED_PLATFORM_ACCESS_FEE',
    details: `Configured User Portal Platform Access Fee to ₹${val.toFixed(2)} per booking for rider cloud dispatch & safety insurance.`,
    severity: 'MEDIUM'
  });
  renderAuditLogs();

  alert(`✅ PLATFORM ACCESS FEE UPDATED TO: ₹${val.toFixed(2)}\n\nThis fee will now dynamically calculate inside customer ride fare breakdown across all Holido apps.`);
}

// 3. PAYMENT METHOD CONVENIENCE FEES MANAGEMENT
function savePaymentConvenienceFees() {
  const keys = ['CASH', 'UPI', 'WALLET', 'DEBIT_CARD', 'CREDIT_CARD', 'NETBANKING'];
  keys.forEach(k => {
    const input = document.getElementById(`adminFee_${k}`);
    if (input) {
      ADMIN_PRICING_CONFIG.paymentConvenienceFees[k] = parseFloat(input.value) || 0.00;
    }
  });

  syncPricingConfigToStorage();

  MOCK_AUDIT_LOGS.unshift({
    id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: 'Just now',
    entity: 'ADMIN',
    actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
    action: 'UPDATED_PAYMENT_CONVENIENCE_FEES',
    details: `Updated convenience fee rules: Cash: ₹${ADMIN_PRICING_CONFIG.paymentConvenienceFees.CASH}, UPI: ₹${ADMIN_PRICING_CONFIG.paymentConvenienceFees.UPI}, Debit Card: ₹${ADMIN_PRICING_CONFIG.paymentConvenienceFees.DEBIT_CARD}, Credit Card: ₹${ADMIN_PRICING_CONFIG.paymentConvenienceFees.CREDIT_CARD}`,
    severity: 'MEDIUM'
  });
  renderAuditLogs();

  alert('💳 PAYMENT CONVENIENCE FEES SAVED SUCCESSFULLY!\n\n' +
    '• Cash to Captain: ₹' + ADMIN_PRICING_CONFIG.paymentConvenienceFees.CASH.toFixed(2) + '\n' +
    '• UPI Instant: ₹' + ADMIN_PRICING_CONFIG.paymentConvenienceFees.UPI.toFixed(2) + '\n' +
    '• Debit Card: +₹' + ADMIN_PRICING_CONFIG.paymentConvenienceFees.DEBIT_CARD.toFixed(2) + '\n' +
    '• Credit Card: +₹' + ADMIN_PRICING_CONFIG.paymentConvenienceFees.CREDIT_CARD.toFixed(2) + '\n' +
    '• NetBanking: +₹' + ADMIN_PRICING_CONFIG.paymentConvenienceFees.NETBANKING.toFixed(2) + '\n' +
    '• Holido Wallet: ₹' + ADMIN_PRICING_CONFIG.paymentConvenienceFees.WALLET.toFixed(2) + '\n\n' +
    'Payment sheet and dynamic checkout fees updated across all User Portals!');
}

function updateVehicleBase(veh, val) {
  ADMIN_PRICING_CONFIG.vehicleBaseFares[veh] = parseFloat(val);
  syncPricingConfigToStorage();
}

function updateVehicleKm(veh, val) {
  ADMIN_PRICING_CONFIG.vehicleKmRates[veh] = parseFloat(val);
  syncPricingConfigToStorage();
}

function onSurgeChange(multiplier) {
  const mult = parseFloat(multiplier);
  ADMIN_PRICING_CONFIG.activeSurgeMultiplier = mult;
  ADMIN_PRICING_CONFIG.geoHexZones.forEach(z => {
    z.multiplier = mult;
    z.active = mult > 1.0;
  });
  renderGeoHexZonesTable();
  syncPricingConfigToStorage();
  alert(`⚡ SURGE PRICING APPLIED: ${mult}x across all Delhi NCR Geo-Hex demand zones.\nBase fares and customer estimates updated automatically.`);
}

function saveRules() {
  saveGeoHexZones();
  savePlatformAccessFee();
  savePaymentConvenienceFees();
}

// ================= ALL-INDIA CITY GEO-FENCING & SERVICE PERMISSION CONTROLS =================

let ADMIN_CITIES = [
  {
    id: 'CITY-AMD',
    name: 'Ahmedabad',
    state: 'Gujarat',
    status: 'ACTIVE',
    services: ['BIKE', 'AUTO', 'CAR', 'PARCEL'],
    radiusKm: 35,
    centerLat: 23.0225,
    centerLng: 72.5714,
    activeCaptains: 42,
    waitlistCount: 0,
    launchDate: '2026-01-15 (LIVE NOW)'
  },
  {
    id: 'CITY-SRT',
    name: 'Surat',
    state: 'Gujarat',
    status: 'COMING_SOON',
    services: ['BIKE', 'AUTO', 'PARCEL'],
    radiusKm: 25,
    centerLat: 21.1702,
    centerLng: 72.8311,
    activeCaptains: 0,
    waitlistCount: 486,
    launchDate: 'Phase 2 (Q1 2027)'
  },
  {
    id: 'CITY-BRD',
    name: 'Vadodara',
    state: 'Gujarat',
    status: 'COMING_SOON',
    services: ['BIKE', 'AUTO', 'CAR', 'PARCEL'],
    radiusKm: 20,
    centerLat: 22.3072,
    centerLng: 73.1812,
    activeCaptains: 0,
    waitlistCount: 312,
    launchDate: 'Phase 2 (Q1 2027)'
  },
  {
    id: 'CITY-RJK',
    name: 'Rajkot',
    state: 'Gujarat',
    status: 'COMING_SOON',
    services: ['BIKE', 'AUTO', 'PARCEL'],
    radiusKm: 20,
    centerLat: 22.3039,
    centerLng: 70.8022,
    activeCaptains: 0,
    waitlistCount: 228,
    launchDate: 'Phase 2 (Q2 2027)'
  },
  {
    id: 'CITY-BOM',
    name: 'Mumbai',
    state: 'Maharashtra',
    status: 'COMING_SOON',
    services: ['BIKE', 'AUTO', 'CAR', 'PARCEL'],
    radiusKm: 50,
    centerLat: 19.0760,
    centerLng: 72.8777,
    activeCaptains: 0,
    waitlistCount: 1850,
    launchDate: 'Phase 3 (Expansion)'
  },
  {
    id: 'CITY-DEL',
    name: 'Delhi NCR',
    state: 'Delhi',
    status: 'COMING_SOON',
    services: ['BIKE', 'AUTO', 'CAR', 'PARCEL'],
    radiusKm: 60,
    centerLat: 28.6139,
    centerLng: 77.2090,
    activeCaptains: 0,
    waitlistCount: 2410,
    launchDate: 'Phase 3 (Expansion)'
  },
  {
    id: 'CITY-BLR',
    name: 'Bengaluru',
    state: 'Karnataka',
    status: 'COMING_SOON',
    services: ['BIKE', 'AUTO', 'CAR', 'PARCEL'],
    radiusKm: 45,
    centerLat: 12.9716,
    centerLng: 77.5946,
    activeCaptains: 0,
    waitlistCount: 1670,
    launchDate: 'Phase 3 (Expansion)'
  }
];

let currentCityFilter = 'ALL';
let currentCitySearch = '';

function loadAdminCitiesConfig() {
  try {
    const raw = localStorage.getItem('holido_city_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ADMIN_CITIES = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading cities config from storage:', e);
  }
}

function syncAdminCitiesConfig() {
  try {
    localStorage.setItem('holido_city_config', JSON.stringify(ADMIN_CITIES));
  } catch (e) {
    console.warn('Error saving cities config to storage:', e);
  }
}

function renderCityLocationsTable(filter = currentCityFilter) {
  loadAdminCitiesConfig();
  const tbody = document.getElementById('cityLocationsTableBody');
  if (!tbody) return;

  currentCityFilter = filter;
  const q = currentCitySearch.toLowerCase().trim();

  // Filter list
  const filtered = ADMIN_CITIES.filter(c => {
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    let matchesCat = true;
    if (filter === 'ACTIVE') matchesCat = c.status === 'ACTIVE';
    else if (filter === 'COMING_SOON') matchesCat = c.status === 'COMING_SOON';
    else if (filter === 'GUJARAT') matchesCat = c.state === 'Gujarat';
    return matchesSearch && matchesCat;
  });

  // Update KPI counters
  const activeCount = ADMIN_CITIES.filter(c => c.status === 'ACTIVE').length;
  const comingCount = ADMIN_CITIES.filter(c => c.status === 'COMING_SOON').length;
  const totalWaitlist = ADMIN_CITIES.reduce((sum, c) => sum + (c.waitlistCount || 0), 0);

  const kpiAct = document.getElementById('kpiActiveCities');
  const kpiCom = document.getElementById('kpiComingSoonCities');
  const kpiWait = document.getElementById('kpiWaitlistRiders');
  const badge = document.getElementById('cityCountBadge');

  if (kpiAct) kpiAct.innerText = `${activeCount} ${activeCount === 1 ? 'City' : 'Cities'}`;
  if (kpiCom) kpiCom.innerText = `${comingCount} Cities`;
  if (kpiWait) kpiWait.innerText = `${totalWaitlist.toLocaleString('en-IN')} Users`;
  if (badge) badge.innerText = `${ADMIN_CITIES.length} CITIES CONFIGURED`;

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#64748B;">No cities match the current filter.</td></tr>`;
    return;
  }

  filtered.forEach(c => {
    const isActive = c.status === 'ACTIVE';
    const isGujarat = c.state === 'Gujarat';

    const serviceBadges = (c.services || ['BIKE', 'AUTO', 'CAR', 'PARCEL']).map(s => {
      const icon = s === 'BIKE' ? '🏍️' : (s === 'AUTO' ? '🛺' : (s === 'CAR' ? '🚗' : '📦'));
      return `<span style="font-size:10.5px; background:#F1F5F9; border:1px solid #E2E8F0; padding:2px 6px; border-radius:4px; font-weight:700;">${icon} ${s}</span>`;
    }).join(' ');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div>
            <div style="font-weight:800; font-size:13.5px; color:#0F172A;">
              ${c.name} ${isGujarat ? '<span style="font-size:10px; background:#FEF3C7; color:#92400E; padding:1px 6px; border-radius:4px; font-weight:bold;">🦁 GUJARAT</span>' : ''}
            </div>
            <div style="font-size:11px; color:#64748B;">${c.state} • ID: ${c.id}</div>
          </div>
        </div>
      </td>
      <td><span style="font-weight:700; color:#006FD4; font-size:12.5px;">${c.radiusKm} km</span></td>
      <td><div style="display:flex; gap:4px; flex-wrap:wrap;">${serviceBadges}</div></td>
      <td>
        <span style="font-weight:800; color:${isActive ? '#059669' : '#64748B'}; font-size:12.5px;">
          ${isActive ? `🟢 ${c.activeCaptains} Online` : '0 (Unlaunched)'}
        </span>
      </td>
      <td>
        <span style="font-weight:700; color:${c.waitlistCount > 0 ? '#D97706' : '#64748B'}; font-size:12px;">
          ${c.waitlistCount > 0 ? `🔔 ${c.waitlistCount} waiting` : '—'}
        </span>
      </td>
      <td>
        <span class="badge-status ${isActive ? 'verified' : 'assigned'}" style="font-size:11px;">
          ${isActive ? '🟢 ACTIVE (LIVE)' : '🟡 COMING SOON'}
        </span>
      </td>
      <td style="text-align:center;">
        <label style="position:relative; display:inline-block; width:44px; height:24px; vertical-align:middle; cursor:pointer;">
          <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleCityStatus('${c.id}')" style="opacity:0; width:0; height:0;">
          <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:${isActive ? '#10B981' : '#CBD5E1'}; transition:.3s; border-radius:24px;"></span>
          <span style="position:absolute; content:''; height:18px; width:18px; left:${isActive ? '22px' : '3px'}; bottom:3px; background:white; transition:.3s; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></span>
        </label>
        <div style="font-size:10px; color:${isActive ? '#059669' : '#64748B'}; font-weight:bold; margin-top:2px;">
          ${isActive ? 'DISPATCH ON' : 'WAITLIST ONLY'}
        </div>
      </td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; gap:6px;">
          <button class="btn-action-edit" onclick="openEditCityModal('${c.id}')" title="Edit City Details">✏️ Edit</button>
          ${c.id !== 'CITY-AMD' ? `<button class="btn-action-reject" onclick="deleteCity('${c.id}')" title="Remove City">🗑️</button>` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterCityCategory(cat) {
  ['ALL', 'ACTIVE', 'COMING_SOON', 'GUJARAT'].forEach(k => {
    const btn = document.getElementById(`cf-${k}`);
    if (btn) btn.classList.toggle('active', k === cat);
  });
  renderCityLocationsTable(cat);
}

function filterCityTable(query) {
  currentCitySearch = query;
  renderCityLocationsTable(currentCityFilter);
}

function toggleCityStatus(cityId) {
  const city = ADMIN_CITIES.find(c => c.id === cityId);
  if (!city) return;

  const newStatus = city.status === 'ACTIVE' ? 'COMING_SOON' : 'ACTIVE';
  city.status = newStatus;
  if (newStatus === 'ACTIVE' && city.activeCaptains === 0) {
    city.activeCaptains = 12; // Initial seed captains for simulation
  }

  syncAdminCitiesConfig();
  renderCityLocationsTable(currentCityFilter);

  const statusMsg = newStatus === 'ACTIVE' 
    ? `🟢 LIVE DISPATCH ENABLED: ${city.name}, ${city.state} is now 100% active! Riders in this city can now book rides immediately.`
    : `🟡 WAITLIST MODE ENABLED: ${city.name}, ${city.state} is now in "We Are Coming Soon" mode. Riders will be prompted to join the waitlist.`;

  alert(`📍 CITY PERMISSION UPDATED!\n\n${statusMsg}`);
}

function openAddCityModal() {
  document.getElementById('cityModalTitle').innerText = '➕ Add New City / Service Zone';
  document.getElementById('editCityId').value = '';
  document.getElementById('modalCityName').value = '';
  document.getElementById('modalCityState').value = 'Gujarat';
  document.getElementById('modalCityStatus').value = 'COMING_SOON';
  document.getElementById('modalCityRadius').value = '30';
  document.getElementById('svcBike').checked = true;
  document.getElementById('svcAuto').checked = true;
  document.getElementById('svcCar').checked = true;
  document.getElementById('svcParcel').checked = true;

  document.getElementById('cityModal').classList.remove('hidden');
}

function openEditCityModal(cityId) {
  const city = ADMIN_CITIES.find(c => c.id === cityId);
  if (!city) return;

  document.getElementById('cityModalTitle').innerText = `✏️ Edit Service Zone: ${city.name} (${city.state})`;
  document.getElementById('editCityId').value = city.id;
  document.getElementById('modalCityName').value = city.name;
  document.getElementById('modalCityState').value = city.state;
  document.getElementById('modalCityStatus').value = city.status;
  document.getElementById('modalCityRadius').value = city.radiusKm;

  const services = city.services || ['BIKE', 'AUTO', 'CAR', 'PARCEL'];
  document.getElementById('svcBike').checked = services.includes('BIKE');
  document.getElementById('svcAuto').checked = services.includes('AUTO');
  document.getElementById('svcCar').checked = services.includes('CAR');
  document.getElementById('svcParcel').checked = services.includes('PARCEL');

  document.getElementById('cityModal').classList.remove('hidden');
}

function saveCityModalData() {
  const cityId = document.getElementById('editCityId').value;
  const name = document.getElementById('modalCityName').value.trim();
  const state = document.getElementById('modalCityState').value.trim();
  const status = document.getElementById('modalCityStatus').value;
  const radiusKm = parseInt(document.getElementById('modalCityRadius').value, 10) || 30;

  if (!name) {
    alert('Please enter a City Name (e.g. Surat, Vadodara, Mumbai)');
    return;
  }

  const services = [];
  if (document.getElementById('svcBike').checked) services.push('BIKE');
  if (document.getElementById('svcAuto').checked) services.push('AUTO');
  if (document.getElementById('svcCar').checked) services.push('CAR');
  if (document.getElementById('svcParcel').checked) services.push('PARCEL');

  if (services.length === 0) {
    alert('Please enable at least one service (Bike, Auto, Car, or Parcel)');
    return;
  }

  if (cityId) {
    // Update existing
    const existing = ADMIN_CITIES.find(c => c.id === cityId);
    if (existing) {
      existing.name = name;
      existing.state = state;
      existing.status = status;
      existing.radiusKm = radiusKm;
      existing.services = services;
    }
  } else {
    // Create new
    const newId = `CITY-${name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    ADMIN_CITIES.push({
      id: newId,
      name,
      state: state || 'Gujarat',
      status,
      services,
      radiusKm,
      centerLat: 23.0000,
      centerLng: 72.0000,
      activeCaptains: status === 'ACTIVE' ? 10 : 0,
      waitlistCount: 0,
      launchDate: status === 'ACTIVE' ? 'LIVE NOW' : 'Expansion Target'
    });
  }

  syncAdminCitiesConfig();
  renderCityLocationsTable(currentCityFilter);
  closeModal('cityModal');

  alert(`✅ CITY ZONE SAVED!\n\nCity: ${name} (${state})\nStatus: ${status === 'ACTIVE' ? '🟢 ACTIVE (LIVE)' : '🟡 COMING SOON'}\nServices: ${services.join(', ')}\nGeo-Fence Radius: ${radiusKm} km\n\nAll customer mobile apps now synchronize with this configuration!`);
}

function deleteCity(cityId) {
  const city = ADMIN_CITIES.find(c => c.id === cityId);
  if (!city) return;

  if (city.id === 'CITY-AMD') {
    alert('Ahmedabad is the primary pilot launch hub and cannot be removed.');
    return;
  }

  if (!confirm(`Are you sure you want to remove ${city.name} (${city.state}) from the service zones?`)) {
    return;
  }

  ADMIN_CITIES = ADMIN_CITIES.filter(c => c.id !== cityId);
  syncAdminCitiesConfig();
  renderCityLocationsTable(currentCityFilter);
  alert(`🗑️ ${city.name} has been removed from service zones.`);
}

// ================= TEAM & RBAC PERMISSIONS =================

let MOCK_TEAM_MEMBERS = [
  {
    id: 'MEM-01',
    name: 'Akshay Kumar',
    email: 'akshay.admin@holido.in',
    role: 'Super Admin',
    status: 'ACTIVE',
    permissions: ['Radar & GPS', 'Trips & SOS', 'Captain KYC', 'Surge & Pricing', 'Bank Payouts', 'Super Settings']
  },
  {
    id: 'MEM-02',
    name: 'Priyansh Patel',
    email: 'priyansh.ops@holido.in',
    role: 'Operations Manager',
    status: 'ACTIVE',
    permissions: ['Radar & GPS', 'Trips & SOS']
  },
  {
    id: 'MEM-03',
    name: 'Hardik Shah',
    email: 'hardik.kyc@holido.in',
    role: 'KYC & Fleet Officer',
    status: 'ACTIVE',
    permissions: ['Captain KYC']
  },
  {
    id: 'MEM-04',
    name: 'Neha Desai',
    email: 'neha.finance@holido.in',
    role: 'Accounts & Payouts',
    status: 'ACTIVE',
    permissions: ['Bank Payouts']
  }
];

function renderTeamTable() {
  const tbody = document.getElementById('teamTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  MOCK_TEAM_MEMBERS.forEach((m) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="profile-avatar" style="width:32px; height:32px; font-size:12px;">${m.name.charAt(0)}</div>
          <div>
            <b>${m.name}</b><br>
            <small style="color:#64748B">${m.id}</small>
          </div>
        </div>
      </td>
      <td><span style="color:#93C5FD">${m.email}</span></td>
      <td>
        <span class="badge-status ${m.role === 'Super Admin' ? 'verified' : 'assigned'}">${m.role}</span>
      </td>
      <td>
        ${m.permissions.map(p => `<span class="perm-pill">${p}</span>`).join('')}
      </td>
      <td>
        <span class="badge-status ${m.status === 'ACTIVE' ? 'verified' : 'pending'}">${m.status}</span>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn-table-action" onclick="openEditRightsModal('${m.id}')">✏️ Edit Rights</button>
          ${m.role !== 'Super Admin' ? `<button class="btn-table-action" style="color:#F87171" onclick="deleteTeamMember('${m.id}')">🗑️ Remove</button>` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddMemberModal() {
  document.getElementById('editMemberId').value = '';
  document.getElementById('modalTeamTitle').innerText = 'Add New Team Member & Assign Rights';
  document.getElementById('memberInputName').value = '';
  document.getElementById('memberInputEmail').value = '';
  document.getElementById('memberRolePreset').value = 'CUSTOM';

  // Uncheck all
  ['radar', 'trips', 'kyc', 'pricing', 'payouts', 'settings'].forEach(p => {
    const el = document.getElementById(`perm_${p}`);
    if (el) el.checked = false;
  });

  document.getElementById('teamModal').classList.remove('hidden');
}

function openEditRightsModal(memberId) {
  const m = MOCK_TEAM_MEMBERS.find(x => x.id === memberId);
  if (!m) return;

  document.getElementById('editMemberId').value = m.id;
  document.getElementById('modalTeamTitle').innerText = `Edit Rights: ${m.name}`;
  document.getElementById('memberInputName').value = m.name;
  document.getElementById('memberInputEmail').value = m.email;

  // Set checkboxes based on existing permissions
  document.getElementById('perm_radar').checked = m.permissions.includes('Radar & GPS');
  document.getElementById('perm_trips').checked = m.permissions.includes('Trips & SOS');
  document.getElementById('perm_kyc').checked = m.permissions.includes('Captain KYC');
  document.getElementById('perm_pricing').checked = m.permissions.includes('Surge & Pricing');
  document.getElementById('perm_payouts').checked = m.permissions.includes('Bank Payouts');
  document.getElementById('perm_settings').checked = m.permissions.includes('Super Settings');

  document.getElementById('teamModal').classList.remove('hidden');
}

function applyRolePreset(role) {
  const map = {
    OPERATIONS: ['radar', 'trips'],
    KYC: ['kyc'],
    FINANCE: ['payouts'],
    SUPERADMIN: ['radar', 'trips', 'kyc', 'pricing', 'payouts', 'settings'],
    CUSTOM: []
  };

  const selected = map[role] || [];
  ['radar', 'trips', 'kyc', 'pricing', 'payouts', 'settings'].forEach(p => {
    const el = document.getElementById(`perm_${p}`);
    if (el) el.checked = selected.includes(p);
  });
}

function saveTeamMemberRights() {
  const memberId = document.getElementById('editMemberId').value;
  const name = document.getElementById('memberInputName').value.trim();
  const email = document.getElementById('memberInputEmail').value.trim();
  const preset = document.getElementById('memberRolePreset').value;

  if (!name || !email) {
    alert('Please enter member name and work email address.');
    return;
  }

  const perms = [];
  if (document.getElementById('perm_radar').checked) perms.push('Radar & GPS');
  if (document.getElementById('perm_trips').checked) perms.push('Trips & SOS');
  if (document.getElementById('perm_kyc').checked) perms.push('Captain KYC');
  if (document.getElementById('perm_pricing').checked) perms.push('Surge & Pricing');
  if (document.getElementById('perm_payouts').checked) perms.push('Bank Payouts');
  if (document.getElementById('perm_settings').checked) perms.push('Super Settings');

  let roleLabel = 'Custom Staff';
  if (preset === 'OPERATIONS') roleLabel = 'Operations Manager';
  else if (preset === 'KYC') roleLabel = 'KYC & Fleet Officer';
  else if (preset === 'FINANCE') roleLabel = 'Accounts & Payouts';
  else if (preset === 'SUPERADMIN' || perms.length === 6) roleLabel = 'Super Admin';

  if (memberId) {
    // Edit existing
    const m = MOCK_TEAM_MEMBERS.find(x => x.id === memberId);
    if (m) {
      m.name = name;
      m.email = email;
      m.role = roleLabel;
      m.permissions = perms;
    }
  } else {
    // Add new
    const newId = `MEM-0${MOCK_TEAM_MEMBERS.length + 1}`;
    MOCK_TEAM_MEMBERS.push({
      id: newId,
      name,
      email,
      role: roleLabel,
      status: 'ACTIVE',
      permissions: perms
    });
  }

  closeModal('teamModal');
  renderTeamTable();
  alert(`✅ Rights assigned successfully to ${name} (${roleLabel})!\n\nAn activation email with login access credentials has been dispatched to ${email}.`);
}

function deleteTeamMember(id) {
  const m = MOCK_TEAM_MEMBERS.find(x => x.id === id);
  if (!m) return;

  if (confirm(`Are you sure you want to revoke access and remove ${m.name} from Holido Admin Team?`)) {
    MOCK_TEAM_MEMBERS = MOCK_TEAM_MEMBERS.filter(x => x.id !== id);
    renderTeamTable();
    alert(`Access revoked for ${m.name}.`);
  }
}

// ================= SUPER ADMIN SECURITY & PASSWORD MANAGER =================

let SUPER_ADMIN_CREDENTIALS = {
  username: 'admin_holido',
  name: 'Akshay Kumar',
  email: 'admin@holido.in',
  securityPin: '482910'
};

function openAdminSecurityModal() {
  document.getElementById('adminInputUsername').value = SUPER_ADMIN_CREDENTIALS.username;
  document.getElementById('adminInputName').value = SUPER_ADMIN_CREDENTIALS.name;
  document.getElementById('adminInputEmail').value = SUPER_ADMIN_CREDENTIALS.email;
  document.getElementById('modalAdminFullname').innerText = SUPER_ADMIN_CREDENTIALS.name;
  document.getElementById('modalAdminAvatar').innerText = SUPER_ADMIN_CREDENTIALS.name.charAt(0);
  document.getElementById('adminSecurityPin').value = SUPER_ADMIN_CREDENTIALS.securityPin;

  // Clear password inputs
  document.getElementById('adminCurrentPassword').value = '';
  document.getElementById('adminNewPassword').value = '';
  document.getElementById('adminConfirmPassword').value = '';

  document.getElementById('adminSecurityModal').classList.remove('hidden');
}

function saveSuperAdminCredentials() {
  const username = document.getElementById('adminInputUsername').value.trim();
  const name = document.getElementById('adminInputName').value.trim();
  const email = document.getElementById('adminInputEmail').value.trim();
  const currentPwd = document.getElementById('adminCurrentPassword').value;
  const newPwd = document.getElementById('adminNewPassword').value;
  const confirmPwd = document.getElementById('adminConfirmPassword').value;
  const pin = document.getElementById('adminSecurityPin').value.trim();

  if (!username || !name || !email) {
    alert('Please enter Super Admin Username, Name, and Email.');
    return;
  }

  // If changing password, validate
  if (newPwd || confirmPwd) {
    if (newPwd.length < 8) {
      alert('New Password must be at least 8 characters long for Super Admin root access.');
      return;
    }
    if (newPwd !== confirmPwd) {
      alert('New Password and Confirm Password do not match. Please re-type.');
      return;
    }
  }

  // Update credentials
  SUPER_ADMIN_CREDENTIALS.username = username;
  SUPER_ADMIN_CREDENTIALS.name = name;
  SUPER_ADMIN_CREDENTIALS.email = email;
  if (pin && pin.length === 6) {
    SUPER_ADMIN_CREDENTIALS.securityPin = pin;
  }

  // Update Topbar UI
  document.getElementById('topAdminName').innerText = name;
  document.getElementById('topAdminAvatar').innerText = name.charAt(0);

  // Update in Team Members table
  if (MOCK_TEAM_MEMBERS.length > 0) {
    MOCK_TEAM_MEMBERS[0].name = name;
    MOCK_TEAM_MEMBERS[0].email = email;
    renderTeamTable();
  }

  // Sync profile view
  updateProfileView();

  // Record Immutable Audit Log
  MOCK_AUDIT_LOGS.unshift({
    id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: 'Just now',
    entity: 'ADMIN',
    actor: `${name} (Super Admin)`,
    action: 'ROOT_CREDENTIALS_CHANGED',
    details: `Updated Super Admin credentials. Username: ${username}, Email: ${email}, PIN: ${pin ? 'Updated' : 'Unchanged'}`,
    severity: 'HIGH'
  });
  renderAuditLogs();

  closeModal('adminSecurityModal');

  alert(`🎉 SUPER ADMIN CREDENTIALS UPDATED SUCCESSFULLY!\n\n` +
        `• New Super Admin ID: ${username}\n` +
        `• Registered Email: ${email}\n` +
        `• Master Security PIN: ${pin}\n` +
        (newPwd ? `• Password: Updated & Hashed securely.\n\n` : `\n`) +
        `All root sessions have been refreshed with the new credentials.`);
}

function updateProfileView() {
  const pageName = document.getElementById('pageAdminName');
  const pageEmail = document.getElementById('pageAdminEmail');
  const pageUser = document.getElementById('pageAdminUsername');
  const pageAvatar = document.getElementById('pageAdminAvatar');

  if (pageName) pageName.innerText = SUPER_ADMIN_CREDENTIALS.name;
  if (pageEmail) pageEmail.innerText = SUPER_ADMIN_CREDENTIALS.email;
  if (pageUser) pageUser.innerText = SUPER_ADMIN_CREDENTIALS.username;
  if (pageAvatar) pageAvatar.innerText = SUPER_ADMIN_CREDENTIALS.name.charAt(0);
}

// ================= 24H FIXED DAILY PASS & TUESDAY PAYOUTS =================

function updateDailyFee(val) {
  const el = document.getElementById('valDailyPassFee');
  if (el) el.innerText = `₹${parseFloat(val).toFixed(2)} / Day`;

  MOCK_AUDIT_LOGS.unshift({
    id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: 'Just now',
    entity: 'ADMIN',
    actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
    action: 'UPDATED_DAILY_PASS_FEE',
    details: `Updated 24-hour Fixed Daily Pass to ₹${val}/day (12:00 AM to 11:59 PM). Deducted before 1st ride.`,
    severity: 'MEDIUM'
  });
  renderAuditLogs();
}

// ================= RIDER-WISE PAYMENT & SETTLEMENT LEDGER =================

let currentSlipCaptainId = null;

let MOCK_RIDER_PAYMENTS = [
  {
    captainId: 'CAP-101',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    category: 'BIKE',
    icon: '🏍️',
    vehicle: 'Hero Splendor Plus',
    plate: 'DL 01 AB 4592',
    bankName: 'State Bank of India (SBI)',
    accountNo: 'XXXXXX8819',
    ifsc: 'SBIN0004210',
    upi: '9876543210@sbi',
    weeklyTrips: 34,
    grossBilled: 4850.00,
    platformCut: 970.00, // 20%
    dailyPassPaid: 174.00, // 6 days x 29
    cashCollected: 1420.00,
    cashDebtAdjusted: 284.00,
    netPayable: 3596.00,
    status: 'SCHEDULED_TUESDAY',
    lastPayoutDate: 'Pending Tuesday 10:00 AM',
    utrNumber: '-'
  },
  {
    captainId: 'CAP-102',
    name: 'Amit Kumar',
    phone: '+91 98111 22334',
    category: 'CAR',
    icon: '🚗',
    vehicle: 'Maruti Suzuki Dzire AC',
    plate: 'DL 02 C 6190',
    bankName: 'HDFC Bank',
    accountNo: 'XXXXXX4421',
    ifsc: 'HDFC0001204',
    upi: 'amit.activa@hdfcbank',
    weeklyTrips: 28,
    grossBilled: 8640.00,
    platformCut: 1728.00, // 20%
    dailyPassPaid: 203.00, // 7 days x 29
    cashCollected: 2100.00,
    cashDebtAdjusted: 420.00,
    netPayable: 6492.00,
    status: 'SCHEDULED_TUESDAY',
    lastPayoutDate: 'Pending Tuesday 10:00 AM',
    utrNumber: '-'
  },
  {
    captainId: 'CAP-103',
    name: 'Vikram Singh',
    phone: '+91 97222 33445',
    category: 'BIKE',
    icon: '🏍️',
    vehicle: 'Bajaj Pulsar 150',
    plate: 'DL 03 BK 1109',
    bankName: 'Punjab National Bank (PNB)',
    accountNo: 'XXXXXX9902',
    ifsc: 'PUNB0140200',
    upi: 'vikram.singh@pnb',
    weeklyTrips: 42,
    grossBilled: 6320.00,
    platformCut: 1264.00, // 20%
    dailyPassPaid: 174.00,
    cashCollected: 1850.00,
    cashDebtAdjusted: 370.00,
    netPayable: 4686.00,
    status: 'SCHEDULED_TUESDAY',
    lastPayoutDate: 'Pending Tuesday 10:00 AM',
    utrNumber: '-'
  },
  {
    captainId: 'CAP-104',
    name: 'Suresh Patel',
    phone: '+91 99333 44556',
    category: 'AUTO',
    icon: '🛺',
    vehicle: 'Bajaj RE Compact Auto',
    plate: 'DL 1R B 7821',
    bankName: 'Bank of Baroda (BOB)',
    accountNo: 'XXXXXX3312',
    ifsc: 'BARB0MAYURX',
    upi: 'suresh.patel@okaxis',
    weeklyTrips: 38,
    grossBilled: 5420.00,
    platformCut: 1084.00, // 20%
    dailyPassPaid: 145.00, // 5 days x 29
    cashCollected: 1600.00,
    cashDebtAdjusted: 320.00,
    netPayable: 4016.00,
    status: 'SCHEDULED_TUESDAY',
    lastPayoutDate: 'Pending Tuesday 10:00 AM',
    utrNumber: '-'
  }
];

let currentRiderVehFilter = 'ALL';
let currentRiderSearchQuery = '';

function filterRiderVehicle(cat) {
  currentRiderVehFilter = cat;
  ['ALL', 'BIKE', 'AUTO', 'CAR'].forEach(k => {
    const btn = document.getElementById(`rf-${k}`);
    if (btn) btn.classList.toggle('active', k === cat);
  });
  renderRiderPaymentsTable(currentRiderSearchQuery);
}

function filterRiderPayments(query) {
  currentRiderSearchQuery = query;
  renderRiderPaymentsTable(query);
}

function renderRiderPaymentsTable(filterQuery = '') {
  const tbodies = [
    document.getElementById('dedicatedRiderPaymentsTableBody'),
    document.getElementById('riderPaymentsTableBody')
  ].filter(Boolean);

  if (tbodies.length === 0) return;

  const q = filterQuery.toLowerCase().trim();
  const filtered = MOCK_RIDER_PAYMENTS.filter(r => {
    const matchesSearch = !q || 
      r.captainId.toLowerCase().includes(q) || 
      r.name.toLowerCase().includes(q) || 
      r.phone.includes(q) || 
      r.upi.toLowerCase().includes(q) || 
      r.bankName.toLowerCase().includes(q) ||
      r.plate.toLowerCase().includes(q);

    const matchesVeh = (currentRiderVehFilter === 'ALL') || (r.category === currentRiderVehFilter);
    return matchesSearch && matchesVeh;
  });

  const b1 = document.getElementById('dedicatedRiderCountBadge');
  const b2 = document.getElementById('riderPaymentCountBadge');
  if (b1) b1.innerText = `${filtered.length} RIDERS ENROLLED`;
  if (b2) b2.innerText = `${filtered.length} CAPTAINS ENROLLED`;

  tbodies.forEach(tbody => {
    tbody.innerHTML = '';
    filtered.forEach(r => {
      const isPaid = r.status === 'PAID';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:22px;">${r.icon}</span>
            <div>
              <b style="color:#0F172A; font-size:13px;">${r.name}</b> 
              <span style="font-family:monospace; color:#006FD4; font-size:11px; font-weight:bold;">(${r.captainId})</span>
              <div style="font-size:11px; color:#64748B; margin-top:1px;">
                <span class="badge-status ${r.category === 'CAR' ? 'verified' : (r.category === 'AUTO' ? 'assigned' : 'in-progress')}" style="font-size:9.5px; padding:1px 5px;">
                  ${r.category}
                </span>
                ${r.vehicle} • <span style="font-family:monospace;">${r.plate}</span>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:6px; padding:4px 8px; display:inline-block;">
            <b style="color:#006FD4; font-size:12px; font-family:monospace;">⚡ ${r.upi}</b>
          </div>
          <div style="font-size:10.5px; color:#64748B; margin-top:3px;">
            ${r.bankName} (A/C: ${r.accountNo})
          </div>
          <div style="font-size:10px; color:#94A3B8; font-family:monospace;">
            IFSC: ${r.ifsc}
          </div>
        </td>
        <td>
          <b style="color:#0F172A; font-size:13.5px;">₹${r.grossBilled.toFixed(2)}</b>
          <div style="font-size:11px; color:#059669; font-weight:600;">${r.weeklyTrips} Trips Completed</div>
        </td>
        <td>
          <span style="color:#DC2626; font-weight:bold; font-size:12.5px;">-₹${r.platformCut.toFixed(2)}</span>
          <div style="font-size:10px; color:#64748B;">20% Platform Commission</div>
        </td>
        <td>
          <div style="font-size:11px; color:#64748B;">
            Pass: <b style="color:#D97706;">-₹${r.dailyPassPaid.toFixed(2)}</b>
          </div>
          <div style="font-size:10px; color:#64748B;">
            Cash Fee: -₹${r.cashDebtAdjusted.toFixed(2)}
          </div>
        </td>
        <td>
          <div style="font-size:15px; font-weight:900; color:#059669;">
            ₹${r.netPayable.toFixed(2)}
          </div>
          <small style="color:#64748B; font-size:10px;">80% Net Payout Pool</small>
        </td>
        <td>
          <span class="badge-status ${isPaid ? 'verified' : 'assigned'}" style="font-size:10.5px;">
            ${isPaid ? 'PAID VIA UPI ✔' : 'SCHEDULED TUESDAY'}
          </span>
          <div style="font-size:9.5px; color:#64748B; margin-top:2px;">
            ${isPaid ? `UTR: ${r.utrNumber}` : 'Cycle: Last Mon - Sun'}
          </div>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:6px;">
            <button class="btn-action-edit" onclick="openRiderPaySlipModal('${r.captainId}')" title="View Detailed Settlement Voucher">
              🧾 Pay Slip
            </button>
            ${!isPaid ? `
              <button class="btn-save-config" onclick="disburseSingleCaptainPayout('${r.captainId}')" style="margin:0; padding:5px 10px; font-size:11px; background:#059669;">
                ⚡ Disburse
              </button>
            ` : `
              <span style="color:#059669; font-size:11px; font-weight:bold; padding:5px;">Settled ✔</span>
            `}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// OPEN RIDER PAY SLIP MODAL
function openRiderPaySlipModal(captainId) {
  const r = MOCK_RIDER_PAYMENTS.find(x => x.captainId === captainId);
  if (!r) return;

  currentSlipCaptainId = captainId;
  const isPaid = r.status === 'PAID';

  document.getElementById('slipModalTitle').innerText = `Settlement Voucher: ${r.name} (${r.captainId})`;

  const modalBody = document.getElementById('slipModalBody');
  modalBody.innerHTML = `
    <!-- HEADER BRANDING & DATES -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #E2E8F0; padding-bottom:14px; margin-bottom:16px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <b style="font-size:18px; color:#042045; letter-spacing:0.5px;">HOLIDO TECHNOLOGIES</b>
          <span class="badge-status verified" style="font-size:10px;">CAPTAIN PAYOUT SLIP</span>
        </div>
        <div style="font-size:11px; color:#64748B; margin-top:3px;">
          Settlement Rail: Automated Tuesday Payouts • Ref: HLD-PAY-W47-${r.captainId}
        </div>
      </div>
      <div style="text-align:right;">
        <span class="badge-status ${isPaid ? 'verified' : 'assigned'}" style="font-size:11px;">
          ${isPaid ? 'DISBURSED / SETTLED ✔' : 'PENDING TUESDAY RUN'}
        </span>
        <div style="font-size:11px; color:#64748B; margin-top:4px;">
          Cycle: <b>Last Week Mon-Sun</b>
        </div>
      </div>
    </div>

    <!-- BENEFICIARY & VEHICLE STRIP -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px; margin-bottom:18px;">
      <div>
        <span style="font-size:10px; font-weight:bold; color:#94A3B8;">CAPTAIN BENEFICIARY</span>
        <div style="font-size:14px; font-weight:800; color:#0F172A; margin-top:2px;">${r.name}</div>
        <div style="font-size:11px; color:#64748B;">Contact: ${r.phone}</div>
        <div style="font-size:11px; color:#006FD4; font-weight:bold; margin-top:2px;">
          ${r.icon} ${r.vehicle} (${r.plate})
        </div>
      </div>

      <div>
        <span style="font-size:10px; font-weight:bold; color:#94A3B8;">PAYOUT DESTINATION</span>
        <div style="font-size:13px; font-weight:800; color:#006FD4; font-family:monospace; margin-top:2px;">
          ⚡ ${r.upi}
        </div>
        <div style="font-size:11px; color:#64748B;">Bank: ${r.bankName} (A/C: ${r.accountNo})</div>
        <div style="font-size:11px; color:#64748B;">IFSC Code: ${r.ifsc} • Verified Digilocker</div>
      </div>
    </div>

    <!-- ITEMIZED EARNINGS STATEMENT TABLE -->
    <div style="border:1px solid #E2E8F0; border-radius:8px; overflow:hidden; margin-bottom:16px;">
      <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
        <tr style="background:#F1F5F9; border-bottom:1px solid #E2E8F0;">
          <th style="padding:10px 14px; text-align:left; color:#475569;">Description</th>
          <th style="padding:10px 14px; text-align:right; color:#475569;">Amount (INR)</th>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:10px 14px;">Gross Booking Fare Billed (GMV) • <b>${r.weeklyTrips} Completed Trips</b></td>
          <td style="padding:10px 14px; text-align:right; font-weight:bold; color:#0F172A;">₹${r.grossBilled.toFixed(2)}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9; color:#DC2626;">
          <td style="padding:10px 14px;">Less: Holido Platform Commission (20%)</td>
          <td style="padding:10px 14px; text-align:right; font-weight:bold;">- ₹${r.platformCut.toFixed(2)}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9; color:#D97706;">
          <td style="padding:10px 14px;">Less: 24h Daily Fixed Passes (Valid 12 AM to 12 AM)</td>
          <td style="padding:10px 14px; text-align:right; font-weight:bold;">- ₹${r.dailyPassPaid.toFixed(2)}</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9; color:#64748B;">
          <td style="padding:10px 14px;">Less: Direct Cash Collected Commission Offset</td>
          <td style="padding:10px 14px; text-align:right; font-weight:bold;">- ₹${r.cashDebtAdjusted.toFixed(2)}</td>
        </tr>
        <tr style="background:#ECFDF5; font-size:14px;">
          <td style="padding:12px 14px; font-weight:900; color:#065F46;">NET PAYABLE TO CAPTAIN (80% Pool)</td>
          <td style="padding:12px 14px; text-align:right; font-weight:900; color:#059669; font-size:16px;">₹${r.netPayable.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <!-- SETTLEMENT UTR & CONFIRMATION -->
    <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:10px 14px; font-size:11.5px; color:#1E40AF; display:flex; justify-content:space-between; align-items:center;">
      <span>🏦 <b>Payment Rail:</b> Cashfree / Razorpay Instant UPI Payouts API</span>
      <span><b>Transaction UTR:</b> <code style="font-family:monospace; background:#DBEAFE; padding:2px 6px; border-radius:4px;">${r.utrNumber !== '-' ? r.utrNumber : 'CMS-PENDING-TUESDAY'}</code></span>
    </div>
  `;

  const btnDisburse = document.getElementById('btnSlipDisburse');
  if (btnDisburse) {
    btnDisburse.style.display = isPaid ? 'none' : 'inline-block';
  }

  document.getElementById('riderPaySlipModal').classList.remove('hidden');
}

function disburseCurrentModalPayout() {
  if (currentSlipCaptainId) {
    disburseSingleCaptainPayout(currentSlipCaptainId);
    openRiderPaySlipModal(currentSlipCaptainId);
  }
}

function disburseSingleCaptainPayout(captainId) {
  const r = MOCK_RIDER_PAYMENTS.find(x => x.captainId === captainId);
  if (!r) return;

  const confirmTransfer = confirm(
    `⚡ DISBURSE TUESDAY WEEKLY PAYOUT\n\n` +
    `Beneficiary: ${r.name} (${r.captainId})\n` +
    `Destination UPI: ${r.upi}\n` +
    `Bank: ${r.bankName}\n` +
    `Net Payout Amount: ₹${r.netPayable.toFixed(2)}\n\n` +
    `Execute instant payout transfer now?`
  );

  if (confirmTransfer) {
    const generatedUtr = 'CMS-UPI-' + Math.floor(10000000 + Math.random() * 90000000);
    r.status = 'PAID';
    r.utrNumber = generatedUtr;
    r.lastPayoutDate = 'Today, Just now';

    MOCK_AUDIT_LOGS.unshift({
      id: `LOG-PAY-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
      entity: 'ADMIN',
      actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
      action: 'CAPTAIN_UPI_PAYOUT_DISBURSED',
      details: `Disbursed ₹${r.netPayable.toFixed(2)} via UPI to ${r.name} (${r.upi}) for Last Week cycle. UTR: ${generatedUtr}`,
      severity: 'HIGH'
    });

    renderRiderPaymentsTable();
    renderAuditLogs();

    alert(
      `🎉 PAYOUT DISBURSED SUCCESSFULLY!\n\n` +
      `• Beneficiary: ${r.name} (${r.captainId})\n` +
      `• Disbursed: ₹${r.netPayable.toFixed(2)}\n` +
      `• UPI ID: ${r.upi}\n` +
      `• Bank UTR Ref: ${generatedUtr}\n\n` +
      `Digital receipt sent to Captain mobile (+${r.phone}).`
    );
  }
}

function processTuesdayWeeklySettlement() {
  const confirmed = confirm(
    "⚡ HOLIDO AUTOMATED TUESDAY WEEKLY PAYOUTS ENGINE\n\n" +
    "Settlement Cycle: Last Week Monday 00:00 AM to Sunday 11:59 PM\n" +
    "• Total Completed Trips: 486 (Bike Taxi + Parcel Couriers)\n" +
    "• Gross Platform Billing (GMV): ₹98,450.00\n" +
    "• Holido 20% Net Commission: ₹19,690.00\n" +
    "• Captain Direct Payout Pool (80%): ₹78,760.00\n\n" +
    "Disburse ₹78,760.00 via automated UPI / IMPS batch transfer to 42 captains now?"
  );

  if (confirmed) {
    const batchId = 'HLD-PAY-' + Math.floor(100000 + Math.random() * 900000);
    
    // Mark all riders in ledger as PAID
    MOCK_RIDER_PAYMENTS.forEach((r, idx) => {
      r.status = 'PAID';
      r.utrNumber = 'CMS-BATCH-' + (84920100 + idx);
      r.lastPayoutDate = 'Tuesday Batch Settled';
    });
    renderRiderPaymentsTable();
    MOCK_AUDIT_LOGS.unshift({
      id: `LOG-ADM-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
      entity: 'ADMIN',
      actor: `${SUPER_ADMIN_CREDENTIALS.name} (Super Admin)`,
      action: 'TUESDAY_PAYOUT_DISBURSED',
      details: `Executed Tuesday weekly payout of ₹78,760.00 to 42 captains for Last Week Mon-Sun cycle (Batch: ${batchId})`,
      severity: 'HIGH'
    });
    renderAuditLogs();

    alert(
      `🎉 TUESDAY WEEKLY SETTLEMENT DISBURSED SUCCESSFULLY!\n\n` +
      `• Payout Batch ID: ${batchId}\n` +
      `• Total Disbursed: ₹78,760.00 (80% pool)\n` +
      `• Beneficiaries: 42 Verified Captains\n` +
      `• Cycle: Last Week Monday 00:00 AM - Sunday 11:59 PM\n` +
      `• Payment Rail: Cashfree Payouts API (Direct UPI & IMPS)\n\n` +
      `All 42 Captain digital wallets credited and SMS settlement receipts dispatched.`
    );
  }
}

// ================= CENTRAL AUDIT & OPERATIONS ACTIVITY LOGS =================

let currentLogFilter = 'ALL';
let currentLogQuery = '';

let MOCK_AUDIT_LOGS = [
  {
    id: 'LOG-ADM-101',
    timestamp: 'Today, 10:15 AM',
    entity: 'ADMIN',
    actor: 'Akshay Kumar (Super Admin)',
    action: 'UPDATED_DAILY_PASS_FEE',
    details: 'Changed 24h Fixed Daily Pass from ₹25 to ₹29 for 12 AM - 12 AM cycle (Mandatory before 1st ride)',
    severity: 'MEDIUM'
  },
  {
    id: 'LOG-ADM-102',
    timestamp: 'Today, 09:30 AM',
    entity: 'ADMIN',
    actor: 'Akshay Kumar (Super Admin)',
    action: 'TUESDAY_PAYOUT_TRIGGERED',
    details: 'Dispatched weekly payout batch ₹78,760 for Last Mon-Sun cycle to 42 captains via UPI Rail',
    severity: 'HIGH'
  },
  {
    id: 'LOG-ADM-103',
    timestamp: 'Today, 08:45 AM',
    entity: 'ADMIN',
    actor: 'Akshay Kumar (Super Admin)',
    action: 'UPDATED_TEAM_RIGHTS',
    details: 'Assigned Operations Manager role to Priyansh Patel with Radar & Trips access permissions',
    severity: 'MEDIUM'
  },
  {
    id: 'LOG-ADM-104',
    timestamp: 'Yesterday, 06:12 PM',
    entity: 'ADMIN',
    actor: 'Akshay Kumar (Super Admin)',
    action: 'SECURITY_PIN_MODIFIED',
    details: 'Master 6-digit security PIN regenerated successfully for root administrative privileges',
    severity: 'HIGH'
  },
  {
    id: 'LOG-RDR-201',
    timestamp: 'Today, 06:05 AM',
    entity: 'RIDER',
    actor: 'Rahul Sharma (CAP-101)',
    action: 'DAILY_PASS_PURCHASED',
    details: 'Paid ₹29 24h Daily Pass (Valid 12:00 AM to 11:59 PM) via wallet balance before 1st ride',
    severity: 'INFO'
  },
  {
    id: 'LOG-RDR-202',
    timestamp: 'Today, 06:08 AM',
    entity: 'RIDER',
    actor: 'Rahul Sharma (CAP-101)',
    action: 'MORNING_SELFIE_VERIFIED',
    details: 'Passed mandatory 1st-ride facial & sanitized helmet scan (Match confidence: 99.2%)',
    severity: 'INFO'
  },
  {
    id: 'LOG-RDR-203',
    timestamp: 'Today, 09:40 AM',
    entity: 'RIDER',
    actor: 'Vikram Singh (CAP-103)',
    action: 'RANDOM_DAYTIME_SELFIE_VERIFIED',
    details: 'Completed random daytime security prompt in 42 seconds (Account sharing check passed)',
    severity: 'INFO'
  },
  {
    id: 'LOG-RDR-204',
    timestamp: 'Today, 10:30 AM',
    entity: 'RIDER',
    actor: 'Amit Kumar (CAP-102)',
    action: 'PARCEL_OTP_VERIFIED',
    details: 'Completed Parcel Delivery HLD-9820; Delivery OTP 9142 verified with recipient',
    severity: 'INFO'
  },
  {
    id: 'LOG-USR-301',
    timestamp: 'Today, 07:15 AM',
    entity: 'USER',
    actor: 'Akshay Kumar (USR-8821)',
    action: 'RIDE_BOOKED',
    details: 'Requested Bike Taxi from India Gate to Connaught Place; Fare: ₹35',
    severity: 'INFO'
  },
  {
    id: 'LOG-USR-302',
    timestamp: 'Today, 07:35 AM',
    entity: 'USER',
    actor: 'Akshay Kumar (USR-8821)',
    action: 'ANONYMOUS_REVIEW_SUBMITTED',
    details: 'Rated Rahul Sharma 5★: "Punctual and very safe riding with helmet." (Customer Name hidden from Captain)',
    severity: 'LOW'
  },
  {
    id: 'LOG-USR-303',
    timestamp: 'Today, 08:20 AM',
    entity: 'USER',
    actor: 'Pooja Verma (USR-8822)',
    action: 'PARCEL_BOOKED',
    details: 'Booked Parcel Delivery to Sector 18 Noida; Pickup OTP 4180 generated',
    severity: 'INFO'
  },
  {
    id: 'LOG-USR-304',
    timestamp: 'Today, 09:50 AM',
    entity: 'USER',
    actor: 'Pooja Verma (USR-8822)',
    action: 'ANONYMOUS_REVIEW_SUBMITTED',
    details: 'Rated Vikram Singh 5★: "Carefully handled my fragile package." (Customer Name hidden from Captain)',
    severity: 'LOW'
  }
];

function filterLogs(category) {
  currentLogFilter = category;

  const btnMap = {
    ALL: 'btnLogAll',
    ADMIN: 'btnLogAdmin',
    RIDER: 'btnLogRider',
    USER: 'btnLogUser'
  };

  Object.keys(btnMap).forEach(k => {
    const btn = document.getElementById(btnMap[k]);
    if (btn) btn.classList.toggle('active', k === category);
  });

  renderAuditLogs();
}

function onLogSearch(query) {
  currentLogQuery = query.toLowerCase().trim();
  renderAuditLogs();
}

function renderAuditLogs() {
  const tbody = document.getElementById('auditLogsTableBody');
  if (!tbody) return;

  // Update counts
  const totalAll = MOCK_AUDIT_LOGS.length;
  const totalAdmin = MOCK_AUDIT_LOGS.filter(x => x.entity === 'ADMIN').length;
  const totalRider = MOCK_AUDIT_LOGS.filter(x => x.entity === 'RIDER').length;
  const totalUser = MOCK_AUDIT_LOGS.filter(x => x.entity === 'USER').length;

  const elAll = document.getElementById('countLogAll');
  const elAdm = document.getElementById('countLogAdmin');
  const elRdr = document.getElementById('countLogRider');
  const elUsr = document.getElementById('countLogUser');

  if (elAll) elAll.innerText = totalAll;
  if (elAdm) elAdm.innerText = totalAdmin;
  if (elRdr) elRdr.innerText = totalRider;
  if (elUsr) elUsr.innerText = totalUser;

  // Filter
  let filtered = MOCK_AUDIT_LOGS;
  if (currentLogFilter !== 'ALL') {
    filtered = filtered.filter(x => x.entity === currentLogFilter);
  }

  if (currentLogQuery) {
    filtered = filtered.filter(x =>
      x.id.toLowerCase().includes(currentLogQuery) ||
      x.actor.toLowerCase().includes(currentLogQuery) ||
      x.action.toLowerCase().includes(currentLogQuery) ||
      x.details.toLowerCase().includes(currentLogQuery)
    );
  }

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748B">No audit logs matching criteria</td></tr>`;
    return;
  }

  filtered.forEach(log => {
    let entityBadge = '';
    if (log.entity === 'ADMIN') {
      entityBadge = `<span class="badge-status verified" style="background:#006FD4; font-weight:bold;">🛡️ SUPER ADMIN</span>`;
    } else if (log.entity === 'RIDER') {
      entityBadge = `<span class="badge-status in-progress" style="background:#059669; font-weight:bold;">🏍️ RIDER (CAPTAIN)</span>`;
    } else {
      entityBadge = `<span class="badge-status assigned" style="background:#FF8100; font-weight:bold;">👤 CUSTOMER</span>`;
    }

    let sevBadge = '';
    if (log.severity === 'HIGH') {
      sevBadge = `<span class="badge-status cancelled" style="background:#DC2626">HIGH RISK</span>`;
    } else if (log.severity === 'MEDIUM') {
      sevBadge = `<span class="badge-status assigned" style="background:#D97706">MEDIUM</span>`;
    } else if (log.severity === 'LOW') {
      sevBadge = `<span class="badge-status verified" style="background:#10B981">LOW</span>`;
    } else {
      sevBadge = `<span class="badge-status" style="background:#0E366E; color:#93C5FD">INFO</span>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-family:monospace; color:#38BDF8; font-weight:bold">${log.id}</span></td>
      <td><span style="color:#94A3B8; font-size:12px">${log.timestamp}</span></td>
      <td>${entityBadge}</td>
      <td><b>${log.actor}</b></td>
      <td><code style="background:#F1F5F9; padding:3px 6px; border-radius:4px; color:#FF8100; font-size:11px; border:1px solid #E2E8F0;">${log.action}</code></td>
      <td style="max-width:340px; font-size:12px; color:#CBD5E1;">${log.details}</td>
      <td>${sevBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportLogsCSV() {
  let csv = 'LOG_ID,TIMESTAMP,ENTITY,ACTOR,ACTION,DETAILS,SEVERITY\n';
  MOCK_AUDIT_LOGS.forEach(l => {
    csv += `"${l.id}","${l.timestamp}","${l.entity}","${l.actor}","${l.action}","${l.details.replace(/"/g, '""')}","${l.severity}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `holido_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ================= ANONYMOUS CUSTOMER REVIEWS =================

let MOCK_REVIEWS = [
  {
    id: 'REV-501',
    service: 'BIKE TAXI',
    captain: 'Rahul Sharma (CAP-101)',
    rating: '5 ★',
    anonymousBadge: 'Verified Holido Rider 🛡️',
    comment: 'Punctual driver, provided clean sanitized helmet. Smooth ride through traffic!',
    privateAuditName: 'Akshay Kumar (+91 98765 11111)',
    date: 'Today, 07:35 AM'
  },
  {
    id: 'REV-502',
    service: 'PARCEL EXPRESS',
    captain: 'Vikram Singh (CAP-103)',
    rating: '5 ★',
    anonymousBadge: 'Verified Parcel Sender 🛡️',
    comment: 'Delivered my sensitive documents safely and on time. Prompt OTP verification at doorstep.',
    privateAuditName: 'Pooja Verma (+91 98111 22222)',
    date: 'Today, 09:50 AM'
  },
  {
    id: 'REV-503',
    service: 'BIKE TAXI',
    captain: 'Amit Kumar (CAP-102)',
    rating: '5 ★',
    anonymousBadge: 'Verified Holido Rider 🛡️',
    comment: 'Very polite rider. Obeyed all traffic signals and rode very comfortably.',
    privateAuditName: 'Rohan Mehra (+91 99222 33333)',
    date: 'Today, 11:20 AM'
  },
  {
    id: 'REV-504',
    service: 'BIKE TAXI',
    captain: 'Suresh Patel (CAP-104)',
    rating: '4 ★',
    anonymousBadge: 'Verified Holido Rider 🛡️',
    comment: 'Good experience, fast pickup within 2 minutes. Recommended for quick commute.',
    privateAuditName: 'Neha Gupta (+91 98333 44444)',
    date: 'Yesterday, 05:40 PM'
  },
  {
    id: 'REV-505',
    service: 'PARCEL EXPRESS',
    captain: 'Rahul Sharma (CAP-101)',
    rating: '5 ★',
    anonymousBadge: 'Verified Parcel Sender 🛡️',
    comment: 'Delivered birthday cake in pristine condition without any tilt or damage!',
    privateAuditName: 'Vikas Sharma (+91 98444 55555)',
    date: 'Yesterday, 02:15 PM'
  }
];

function renderReviewsTable() {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  MOCK_REVIEWS.forEach(r => {
    const isBike = r.service === 'BIKE TAXI';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-family:monospace; color:#38BDF8; font-weight:bold">${r.id}</span></td>
      <td>
        <span class="badge-status ${isBike ? 'verified' : 'assigned'}" style="font-size:11px;">
          ${isBike ? '🚴 BIKE TAXI' : '📦 PARCEL'}
        </span>
      </td>
      <td><b>${r.captain}</b></td>
      <td><span style="color:#FBBF24; font-weight:800; font-size:13px;">${r.rating}</span></td>
      <td>
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="badge-status verified" style="font-size:11px; background:#065F46;">${r.anonymousBadge}</span>
        </div>
        <div style="font-size:10px; color:#64748B; margin-top:2px;">(Customer name hidden from driver)</div>
      </td>
      <td style="max-width:320px; font-size:12px; color:#CBD5E1;">"${r.comment}"</td>
      <td>
        <span style="font-family:monospace; color:#FF8100; font-size:11px; background:#F1F5F9; padding:4px 8px; border-radius:4px; border:1px solid #E2E8F0;">
          🔒 ${r.privateAuditName}
        </span>
      </td>
      <td><span style="color:#94A3B8; font-size:11px">${r.date}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// Initial Run
function initAdminApp() {
  try { drawRadar(); } catch (e) { console.warn('drawRadar init:', e); }
  try { renderTrips(); } catch (e) { console.warn('renderTrips init:', e); }
  try { renderCaptains(); } catch (e) { console.warn('renderCaptains init:', e); }
  try { renderRiderPaymentsTable(); } catch (e) { console.warn('renderRiderPaymentsTable init:', e); }
  try { renderCityLocationsTable(); } catch (e) { console.warn('renderCityLocationsTable init:', e); }
  try { renderTeamTable(); } catch (e) { console.warn('renderTeamTable init:', e); }
  try { renderAuditLogs(); } catch (e) { console.warn('renderAuditLogs init:', e); }
  try { renderReviewsTable(); } catch (e) { console.warn('renderReviewsTable init:', e); }
  try { loadAdminPricingConfig(); } catch (e) { console.warn('loadAdminPricingConfig init:', e); }
  try { updateProfileView(); } catch (e) { console.warn('updateProfileView init:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminApp);
} else {
  initAdminApp();
}
