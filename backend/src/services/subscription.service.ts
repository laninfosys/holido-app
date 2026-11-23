export interface DailyPass {
  id: string;
  captainId: string;
  dateString: string; // YYYY-MM-DD
  feePaid: number;
  purchasedAt: Date;
  expiresAt: Date; // Midnight 11:59:59 PM
  status: 'ACTIVE' | 'EXPIRED';
}

export class SubscriptionService {
  // Admin-configurable daily 24h pass fee (12 AM to 12 AM)
  private static dailyFee: number = 29.0;
  private static passes: Map<string, DailyPass> = new Map(); // key: captainId:YYYY-MM-DD

  static getDailyFee(): number {
    return this.dailyFee;
  }

  static setDailyFee(fee: number): void {
    this.dailyFee = fee;
    console.log(`[SubscriptionService] Admin updated 24h Daily Fee to ₹${fee}`);
  }

  private static getTodayString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  private static getTodayMidnightExpiry(): Date {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * Checks if Captain has paid their daily pass for today (12 AM to 12 AM)
   */
  static hasActiveDailyPass(captainId: string): boolean {
    const key = `${captainId}:${this.getTodayString()}`;
    const pass = this.passes.get(key);
    if (!pass) return false;
    return new Date() <= pass.expiresAt && pass.status === 'ACTIVE';
  }

  /**
   * Captain pays daily fee before starting their 1st ride/parcel of the day
   */
  static purchaseDailyPass(captainId: string, customFee?: number): DailyPass {
    const todayStr = this.getTodayString();
    const key = `${captainId}:${todayStr}`;
    const fee = customFee !== undefined ? customFee : this.dailyFee;

    const pass: DailyPass = {
      id: `pass_${Date.now()}_${captainId}`,
      captainId,
      dateString: todayStr,
      feePaid: fee,
      purchasedAt: new Date(),
      expiresAt: this.getTodayMidnightExpiry(),
      status: 'ACTIVE',
    };

    this.passes.set(key, pass);
    console.log(`[SubscriptionService] Daily pass activated for Captain ${captainId} (₹${fee}) till midnight 12 AM`);
    return pass;
  }

  static getAllActivePasses(): DailyPass[] {
    return Array.from(this.passes.values());
  }
}
