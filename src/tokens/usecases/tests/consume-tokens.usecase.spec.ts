import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { InsufficientTokensError } from '../../domain/errors/insufficient-tokens.error';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TokenBalanceRepository } from '../../infrastructure/repositories/token-balance.repository';
import { TokenTransactionRepository } from '../../infrastructure/repositories/token-transaction.repository';
import { ConsumeTokensUseCase } from '../consume-tokens.usecase';

describe('ConsumeTokensUseCase', () => {
  let useCase: ConsumeTokensUseCase;
  let tokenBalanceRepository: jest.Mocked<TokenBalanceRepository>;
  let tokenTransactionRepository: jest.Mocked<TokenTransactionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumeTokensUseCase,
        {
          provide: TokenBalanceRepository,
          useValue: {
            findByUserId: jest.fn(),
            decrementBalance: jest.fn(),
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

    useCase = module.get<ConsumeTokensUseCase>(ConsumeTokensUseCase);
    tokenBalanceRepository = module.get(TokenBalanceRepository);
    tokenTransactionRepository = module.get(TokenTransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should consume tokens successfully when balance is sufficient', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 1;
      const metadata = { tattooGenerationId: 'gen-123' };
      
      const currentBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 5,
        totalPurchased: 10,
        totalConsumed: 5,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBalance = { ...currentBalance, balance: 4, totalConsumed: 6 };
      const transaction = {
        id: 'transaction-id',
        userId,
        userType,
        userTypeId,
        type: TransactionType.CONSUME,
        amount: -amount,
        balanceBefore: 5,
        balanceAfter: 4,
        status: TransactionStatus.COMPLETED,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(currentBalance);
      tokenBalanceRepository.decrementBalance.mockResolvedValue(updatedBalance);
      tokenTransactionRepository.create.mockResolvedValue(transaction);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId, amount, metadata });

      // Assert
      expect(result).toEqual({
        success: true,
        remainingBalance: 4,
        transactionId: 'transaction-id',
      });
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.decrementBalance).toHaveBeenCalledWith(userId, amount);
      expect(tokenTransactionRepository.create).toHaveBeenCalledWith({
        userId,
        userType,
        userTypeId,
        type: TransactionType.CONSUME,
        amount: -amount,
        balanceBefore: 5,
        balanceAfter: 4,
        status: TransactionStatus.COMPLETED,
        metadata,
      });
    });

    it('should throw InsufficientTokensError when balance is insufficient', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 5;
      
      const currentBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 2,
        totalPurchased: 10,
        totalConsumed: 8,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(currentBalance);

      // Act & Assert
      await expect(useCase.execute({ userId, userType, userTypeId, amount })).rejects.toThrow(InsufficientTokensError);
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.decrementBalance).not.toHaveBeenCalled();
      expect(tokenTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InsufficientTokensError for user with no balance record', async () => {
      // Arrange
      const userId = 'new-user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-789';
      const amount = 1;

      tokenBalanceRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute({ userId, userType, userTypeId, amount })).rejects.toThrow(InsufficientTokensError);
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.decrementBalance).not.toHaveBeenCalled();
      expect(tokenTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors during balance check', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 1;
      const error = new Error('Database connection failed');

      tokenBalanceRepository.findByUserId.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute({ userId, userType, userTypeId, amount })).rejects.toThrow(error);
    });

    it('should handle repository errors during balance decrement', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const amount = 1;
      
      const currentBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 5,
        totalPurchased: 10,
        totalConsumed: 5,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const error = new Error('Concurrency error');

      tokenBalanceRepository.findByUserId.mockResolvedValue(currentBalance);
      tokenBalanceRepository.decrementBalance.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute({ userId, userType, userTypeId, amount })).rejects.toThrow(error);
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.decrementBalance).toHaveBeenCalledWith(userId, amount);
      expect(tokenTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should consume multiple tokens at once', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.ARTIST;
      const userTypeId = 'artist-456';
      const amount = 3;
      
      const currentBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 10,
        totalPurchased: 15,
        totalConsumed: 5,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBalance = { ...currentBalance, balance: 7, totalConsumed: 8 };
      const transaction = {
        id: 'transaction-id',
        userId,
        userType,
        userTypeId,
        type: TransactionType.CONSUME,
        amount: -amount,
        balanceBefore: 10,
        balanceAfter: 7,
        status: TransactionStatus.COMPLETED,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(currentBalance);
      tokenBalanceRepository.decrementBalance.mockResolvedValue(updatedBalance);
      tokenTransactionRepository.create.mockResolvedValue(transaction);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId, amount });

      // Assert
      expect(result).toEqual({
        success: true,
        remainingBalance: 7,
        transactionId: 'transaction-id',
      });
    });
  });
});