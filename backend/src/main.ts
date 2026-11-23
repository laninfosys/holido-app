import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CaptainService } from './services/captain.service';
import { RideService } from './services/ride.service';
import { ParcelService } from './services/parcel.service';
import { PricingService } from './services/pricing.service';
import { SocketGateway } from './gateways/socket.gateway';
import { PaymentService } from './services/payment.service';
import { Coordinates, ServiceType } from './types';

const app = express();
const server = createServer(app);

// Enable CORS for mobile apps and web simulation
app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize services
const captainService = new CaptainService();
const rideService = new RideService();
const parcelService = new ParcelService();

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

new SocketGateway(io, captainService, rideService, parcelService);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Holido Ride-Hailing & Parcel Dispatch Engine',
    timestamp: new Date().toISOString(),
  });
});

// Calculate fare estimate
app.post('/api/pricing/estimate', (req: Request, res: Response) => {
  try {
    const { pickup, drop, serviceType, weightCategory } = req.body;
    if (!pickup || !drop) {
      return res.status(400).json({ error: 'Pickup and Drop coordinates are required' });
    }

    const fare = PricingService.calculateFare(
      pickup as Coordinates,
      drop as Coordinates,
      (serviceType || 'BIKE_TAXI') as ServiceType,
      weightCategory || 'UP_TO_2KG'
    );

    res.json(fare);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby online captains for map view
app.get('/api/captains/nearby', (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat((req.query.radius as string) || '5.0');

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng query params required' });
    }

    const nearby = captainService.findNearbyCaptains({ latitude: lat, longitude: lng }, radius);
    res.json(nearby);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request a bike ride
app.post('/api/rides/request', (req: Request, res: Response) => {
  try {
    const { customerId, customerName, customerPhone, pickup, drop, autoSimulate } = req.body;
    const ride = rideService.createRide(
      customerId || 'cust-user-1',
      customerName || 'Test Customer',
      customerPhone || '+91 99999 88888',
      pickup,
      drop
    );

    // Broadcast to room
    io.emit('ride:created', ride);

    res.status(201).json(ride);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request parcel courier delivery
app.post('/api/parcels/request', (req: Request, res: Response) => {
  try {
    const {
      senderId,
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      packageType,
      weightCategory,
      pickup,
      drop,
      packageInstructions,
    } = req.body;

    const parcel = parcelService.createParcelOrder(
      senderId || 'sender-user-1',
      senderName || 'Sender',
      senderPhone || '+91 99999 77777',
      receiverName || 'Receiver',
      receiverPhone || '+91 88888 66666',
      packageType || 'DOCUMENTS',
      weightCategory || 'UP_TO_2KG',
      pickup,
      drop,
      packageInstructions
    );

    res.status(201).json(parcel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================= PAYMENT GATEWAY APIS =================

// Create Razorpay / UPI order for a ride
app.post('/api/payments/create-order', (req: Request, res: Response) => {
  try {
    const { rideId, amount, customerName, customerPhone } = req.body;
    if (!rideId || !amount) {
      return res.status(400).json({ error: 'rideId and amount are required' });
    }

    const order = PaymentService.createRideOrder(
      rideId,
      amount,
      customerName || 'Holido Customer',
      customerPhone || '+91 99999 88888'
    );

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Razorpay payment signature
app.post('/api/payments/verify', (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const isValid = PaymentService.verifyPaymentSignature(orderId, paymentId, signature);

    if (isValid) {
      res.json({ success: true, message: 'Payment successfully verified!' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger instant captain payout via UPI/IMPS
app.post('/api/payments/captain-payout', (req: Request, res: Response) => {
  try {
    const { captainId, captainName, upiId, amount } = req.body;
    const result = PaymentService.processCaptainPayout({
      captainId,
      captainName,
      upiId,
      amount,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Holido Real-Time Dispatch Server running on port ${PORT}`);
  console.log(`🚴 Services: Holido Bike Taxi & Holido Parcel`);
  console.log(`===============================================`);
});
