import { BetaSignupDto } from '../dtos/betaSignup.dto';

export interface IBetaSignupService {
  processBetaSignup(data: BetaSignupDto): Promise<void>;
}