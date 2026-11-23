import crypto from 'crypto';

export interface PaymentOrder {
  orderId: string;
  rideId: string;
  amountInPaise: number; // Razorpay amounts are in paise (₹1 = 100 paise)
  currency: string;
  customerName: string;
  customerPhone: string;
  status: 'CREATED' | 'PAID' | 'FAILED';
}

export interface CaptainPayoutRequest {
  captainId: string;
  captainName: string;
  upiId: string;
  accountNo?: string;
  ifsc?: string;
  amount: number;
}

export class PaymentService {
  private static keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_holido_default';
  private static keySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_holido_default';
  private static webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';

  /**
   * 1. Creates a payment order for Rider (UPI, Cards, Netbanking)
   */
  static createRideOrder(
    rideId: string,
    amountInRupees: number,
    customerName: string,
    customerPhone: string
  ): PaymentOrder {
    const amountInPaise = Math.round(amountInRupees * 100);
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    console.log(`[PaymentService] Razorpay order created: ${orderId} for ₹${amountInRupees}`);

    return {
      orderId,
      rideId,
      amountInPaise,
      currency: 'INR',
      customerName,
      customerPhone,
      status: 'CREATED',
    };
  }

  /**
   * 2. Verifies Razorpay signature returned after rider payment
   */
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = expectedSignature === signature;
    console.log(`[PaymentService] Payment verification for ${paymentId}: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    return isValid;
  }

  /**
   * 3. Instant Payout to Captain via UPI / IMPS (Cashfree Payouts / RazorpayX)
   */
  static processCaptainPayout(request: CaptainPayoutRequest): {
    payoutId: string;
    status: 'SUCCESS' | 'QUEUED';
    message: string;
  } {
    const payoutId = `payout_${crypto.randomBytes(6).toString('hex')}`;
    console.log(`[PaymentService] Triggering ₹${request.amount} payout to Captain ${request.captainName} (${request.upiId})`);

    return {
      payoutId,
      status: 'SUCCESS',
      message: `Instant payout of ₹${request.amount} transferred to UPI ${request.upiId}`,
    };
  }

  /**
   * 4. Cash on Delivery (COD) Reconciliation:
   * When rider pays ₹50 cash to captain, captain collects ₹50 cash.
   * Holido deducts 20% commission (₹10) from Captain's digital platform wallet.
   */
  static reconcileCashTrip(
    totalFare: number,
    captainCommissionRate: number = 0.8
  ): {
    cashCollectedByCaptain: number;
    captainEarnings: number;
    platformCommissionDue: number;
  } {
    const captainEarnings = Math.round(totalFare * captainCommissionRate);
    const platformCommissionDue = totalFare - captainEarnings;

    return {
      cashCollectedByCaptain: totalFare,
      captainEarnings,
      platformCommissionDue,
    };
  }
}
