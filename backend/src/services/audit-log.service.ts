export type LogCategory = 'ADMIN' | 'RIDER' | 'USER';

export interface AuditLogEntry {
  id: string;
  category: LogCategory;
  actor: string; // e.g. "Super Admin (Akshay)", "Captain Rahul (CAP-101)", "User Rohan"
  action: string; // e.g. "SURGE_UPDATED", "SELFIE_VERIFIED", "DAILY_PASS_PURCHASED"
  details: string;
  timestamp: Date;
  ipAddress?: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}

export class AuditLogService {
  private static logs: AuditLogEntry[] = [
    {
      id: 'LOG-1001',
      category: 'ADMIN',
      actor: 'Super Admin (Akshay)',
      action: 'TEAM_RIGHTS_ASSIGNED',
      details: 'Assigned "KYC & Fleet Officer" permissions to hardik.kyc@holido.in',
      timestamp: new Date(Date.now() - 3600000 * 2),
      severity: 'SUCCESS',
    },
    {
      id: 'LOG-1002',
      category: 'ADMIN',
      actor: 'Super Admin (Akshay)',
      action: 'SURGE_PRICE_CHANGED',
      details: 'Updated rain surge multiplier to 1.5x in Central Delhi hexes',
      timestamp: new Date(Date.now() - 3600000 * 3),
      severity: 'WARNING',
    },
    {
      id: 'LOG-1003',
      category: 'RIDER',
      actor: 'Captain Rahul Sharma (CAP-101)',
      action: 'DAILY_PASS_PURCHASED',
      details: 'Paid ₹29 24h Daily Pass (Valid 12:00 AM to 11:59 PM today)',
      timestamp: new Date(Date.now() - 3600000 * 6),
      severity: 'INFO',
    },
    {
      id: 'LOG-1004',
      category: 'RIDER',
      actor: 'Captain Rahul Sharma (CAP-101)',
      action: 'FIRST_RIDE_SELFIE_VERIFIED',
      details: 'Selfie biometric facial match: 98.6% • Sanitized helmet detected',
      timestamp: new Date(Date.now() - 3600000 * 5.8),
      severity: 'SUCCESS',
    },
    {
      id: 'LOG-1005',
      category: 'RIDER',
      actor: 'Captain Amit Kumar (CAP-102)',
      action: 'RANDOM_DAY_SELFIE_CHECK',
      details: 'Random afternoon audit prompt passed (Face match: 99.1%)',
      timestamp: new Date(Date.now() - 3600000 * 1.5),
      severity: 'SUCCESS',
    },
    {
      id: 'LOG-1006',
      category: 'USER',
      actor: 'Customer Akshay Kumar (+91 98765 11111)',
      action: 'TRIP_BOOKED',
      details: 'Booked Bike Taxi from India Gate to Connaught Place (Fare: ₹35)',
      timestamp: new Date(Date.now() - 3600000 * 0.8),
      severity: 'INFO',
    },
    {
      id: 'LOG-1007',
      category: 'USER',
      actor: 'Customer Pooja Verma (+91 98111 22222)',
      action: 'PARCEL_BOOKED',
      details: 'Dispatched 1.5kg Documents courier to Sector 18 Noida (Fare: ₹65)',
      timestamp: new Date(Date.now() - 3600000 * 1.2),
      severity: 'INFO',
    },
    {
      id: 'LOG-1008',
      category: 'USER',
      actor: 'Anonymous Rider (Verified)',
      action: 'REVIEW_SUBMITTED',
      details: 'Submitted 5★ anonymous review for Captain Rahul ("Polite driver, safe helmet")',
      timestamp: new Date(Date.now() - 3600000 * 0.3),
      severity: 'SUCCESS',
    },
    {
      id: 'LOG-1009',
      category: 'ADMIN',
      actor: 'Super Admin (Akshay)',
      action: 'TUESDAY_PAYOUT_SCHEDULED',
      details: 'Processed weekly settlement cycle (Mon-Sun) of ₹78,760 for 42 captains',
      timestamp: new Date(Date.now() - 3600000 * 24),
      severity: 'SUCCESS',
    },
  ];

  static log(
    category: LogCategory,
    actor: string,
    action: string,
    details: string,
    severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO'
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      category,
      actor,
      action,
      details,
      timestamp: new Date(),
      severity,
    };
    this.logs.unshift(entry);
    console.log(`[AuditLog] [${category}] [${action}] ${actor}: ${details}`);
    return entry;
  }

  static getLogs(category?: LogCategory): AuditLogEntry[] {
    if (!category || category === ('ALL' as any)) return this.logs;
    return this.logs.filter((l) => l.category === category);
  }
}
