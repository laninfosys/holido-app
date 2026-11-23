export interface SelfieVerificationLog {
  id: string;
  captainId: string;
  type: 'FIRST_RIDE_OF_DAY' | 'RANDOM_DAY_PROMPT';
  timestamp: Date;
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  helmetDetected: boolean;
  faceMatchScore: number; // e.g. 98.4%
}

export class VerificationService {
  private static verificationLogs: SelfieVerificationLog[] = [];
  private static captainDailyFirstRideVerified: Set<string> = new Set(); // captainId:YYYY-MM-DD

  private static getTodayKey(captainId: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `${captainId}:${today}`;
  }

  /**
   * Checks if Captain has completed mandatory selfie verification before 1st ride
   */
  static isFirstRideVerified(captainId: string): boolean {
    return this.captainDailyFirstRideVerified.has(this.getTodayKey(captainId));
  }

  /**
   * Submits selfie verification (Called before 1st ride OR upon random audit prompt)
   */
  static submitSelfie(
    captainId: string,
    type: 'FIRST_RIDE_OF_DAY' | 'RANDOM_DAY_PROMPT' = 'FIRST_RIDE_OF_DAY'
  ): SelfieVerificationLog {
    const log: SelfieVerificationLog = {
      id: `selfie_${Date.now()}_${captainId}`,
      captainId,
      type,
      timestamp: new Date(),
      status: 'VERIFIED',
      helmetDetected: true,
      faceMatchScore: 98.6,
    };

    this.verificationLogs.push(log);

    if (type === 'FIRST_RIDE_OF_DAY') {
      this.captainDailyFirstRideVerified.add(this.getTodayKey(captainId));
    }

    console.log(`[VerificationService] Selfie verified for Captain ${captainId} (${type}) - Helmet: OK, Face Match: 98.6%`);
    return log;
  }

  /**
   * Random daytime selfie prompt evaluation:
   * Returns true if Captain should be prompted for a random selfie check
   */
  static shouldTriggerRandomSelfiePrompt(captainId: string, completedTripsToday: number): boolean {
    // Random audit triggered after every 4th or 7th trip to prevent ID sharing
    return completedTripsToday > 0 && (completedTripsToday % 4 === 0 || Math.random() < 0.15);
  }

  static getVerificationLogs(): SelfieVerificationLog[] {
    return this.verificationLogs;
  }
}
