import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TokenBalanceRepository } from '../../infrastructure/repositories/token-balance.repository';
import { TokenTransactionRepository } from '../../infrastructure/repositories/token-transaction.repository';
import { GrantTokensUseCase } from '../grant-tokens.usecase';

describe('GrantTokensUseCase', () => {
  let useCase: GrantTokensUseCase;
  let tokenBalanceRepository: jest.Mocked<TokenBalanceRepository>;
  let tokenTransactionRepository: jest.Mocked<TokenTransactionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrantTokensUseCase,
        {
          provide: TokenBalanceRepository,
          useValue: {
            findByUserId: jest.fn(),
            create: jest.fn(),
            incrementBalance: jest.fn(),
          },
        },
        {
          provide: TokenTransactionRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GrantTokensUseCase>(GrantTokensUseCase);
    tokenBalanceRepository = module.get(TokenBalanceRepository);
    tokenTransactionRepository = module.get(TokenTransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should grant tokens to existing user successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 10;
      const reason = 'Welcome bonus';
      const metadata = { promotionType: 'WELCOME_BONUS' };

      const currentBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 5,
        totalPurchased: 0,
        totalConsumed: 0,
        totalGranted: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBalance = { ...currentBalance, balance: 15, totalGranted: 15 };
      const transaction = {
        id: 'transaction-id',
        userId,
        userType,
        userTypeId,
        type: TransactionType.GRANT,
        amount,
        balanceBefore: 5,
        balanceAfter: 15,
        status: TransactionStatus.COMPLETED,
        metadata: { ...metadata, reason },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(currentBalance);
      tokenBalanceRepository.incrementBalance.mockResolvedValue(updatedBalance);
      tokenTransactionRepository.create.mockResolvedValue(transaction);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId, amount, reason, metadata });

      // Assert
      expect(result).toEqual({
        success: true,
        newBalance: 15,
        transactionId: 'transaction-id',
      });
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.incrementBalance).toHaveBeenCalledWith(userId, amount, true);
      expect(tokenTransactionRepository.create).toHaveBeenCalledWith({
        userId,
        userType,
        userTypeId,
        type: TransactionType.GRANT,
        amount,
        balanceBefore: 5,
        balanceAfter: 15,
        status: TransactionStatus.COMPLETED,
        metadata: { ...metadata, reason },
      });
    });

    it('should create new balance and grant tokens for new user', async () => {
      // Arrange
      const userId = 'new-user-123';
      const userType = UserType.ARTIST;
      const userTypeId = 'artist-789';
      const amount = 3;
      const reason = 'Registration bonus';
      const metadata = { promotionType: 'WELCOME_BONUS' };

      const newBalance = {
        id: 'new-balance-id',
        userId,
        userType,
        userTypeId,
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBalance = { ...newBalance, balance: 3, totalGranted: 3 };
      const transaction = {
        id: 'transaction-id',
        userId,
        userType,
        userTypeId,
        type: TransactionType.GRANT,
        amount,
        balanceBefore: 0,
        balanceAfter: 3,
        status: TransactionStatus.COMPLETED,
        metadata: { ...metadata, reason },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(null);
      tokenBalanceRepository.create.mockResolvedValue(newBalance);
      tokenBalanceRepository.incrementBalance.mockResolvedValue(updatedBalance);
      tokenTransactionRepository.create.mockResolvedValue(transaction);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId, amount, reason, metadata });

      // Assert
      expect(result).toEqual({
        success: true,
        newBalance: 3,
        transactionId: 'transaction-id',
      });
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.create).toHaveBeenCalledWith({
        userId,
        userType,
        userTypeId,
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
        totalGranted: 0,
      });
      expect(tokenBalanceRepository.incrementBalance).toHaveBeenCalledWith(userId, amount, true);
    });

    it('should handle repository errors during balance lookup', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 10;
      const reason = 'Promotion';
      const error = new Error('Database connection failed');

      tokenBalanceRepository.findByUserId.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute({ userId, userType, userTypeId, amount, reason })).rejects.toThrow(error);
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.incrementBalance).not.toHaveBeenCalled();
      expect(tokenTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should handle large token grants', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 1000;
      const reason = 'Contest winner';
      const metadata = { contestId: 'contest-123' };

      const currentBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 10,
        totalPurchased: 50,
        totalConsumed: 40,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBalance = { ...currentBalance, balance: 1010, totalGranted: 1000 };
      const transaction = {
        id: 'transaction-id',
        userId,
        userType,
        userTypeId,
        type: TransactionType.GRANT,
        amount,
        balanceBefore: 10,
        balanceAfter: 1010,
        status: TransactionStatus.COMPLETED,
        metadata: { ...metadata, reason },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(currentBalance);
      tokenBalanceRepository.incrementBalance.mockResolvedValue(updatedBalance);
      tokenTransactionRepository.create.mockResolvedValue(transaction);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId, amount, reason, metadata });

      // Assert
      expect(result).toEqual({
        success: true,
        newBalance: 1010,
        transactionId: 'transaction-id',
      });
    });

    it('should include admin information in metadata when provided', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 50;
      const reason = 'Manual adjustment';
      const metadata = { 
        adminUserId: 'admin-789',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const currentBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBalance = { ...currentBalance, balance: 50, totalGranted: 50 };
      const transaction = {
        id: 'transaction-id',
        userId,
        userType,
        userTypeId,
        type: TransactionType.GRANT,
        amount,
        balanceBefore: 0,
        balanceAfter: 50,
        status: TransactionStatus.COMPLETED,
        metadata: { ...metadata, reason },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(currentBalance);
      tokenBalanceRepository.incrementBalance.mockResolvedValue(updatedBalance);
      tokenTransactionRepository.create.mockResolvedValue(transaction);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId, amount, reason, metadata });

      // Assert
      expect(result).toEqual({
        success: true,
        newBalance: 50,
        transactionId: 'transaction-id',
      });
      expect(tokenTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            adminUserId: 'admin-789',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            reason: 'Manual adjustment',
          }),
        })
      );
    });
  });
});