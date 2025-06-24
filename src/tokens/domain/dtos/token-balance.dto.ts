import { UserType } from '../../../users/domain/enums/userType.enum';

export class TokenBalanceDto {
  id: string;
  userId: string;
  userType: UserType;
  userTypeId: string;
  balance: number;
  totalPurchased: number;
  totalConsumed: number;
  totalGranted: number;
  lastPurchaseAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}