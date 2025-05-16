export interface IReputationService {
  adjustReputation(userId: string, points: number, reason: string): Promise<void>;
  getUserReputation(userId: string): Promise<{ userId: string; currentScore: number; history: any[] }>;
}

export const IReputationService = Symbol('IReputationService'); 