import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { TokenBalanceRepository } from '../../infrastructure/repositories/token-balance.repository';
import { GetTokenBalanceUseCase } from '../get-token-balance.usecase';

describe('GetTokenBalanceUseCase', () => {
  let useCase: GetTokenBalanceUseCase;
  let tokenBalanceRepository: jest.Mocked<TokenBalanceRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTokenBalanceUseCase,
        {
          provide: TokenBalanceRepository,
          useValue: {
            findByUserId: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetTokenBalanceUseCase>(GetTokenBalanceUseCase);
    tokenBalanceRepository = module.get(TokenBalanceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return existing balance when user has tokens', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const existingBalance = {
        id: 'balance-id',
        userId,
        userType,
        userTypeId,
        balance: 10,
        totalPurchased: 10,
        totalConsumed: 0,
        totalGranted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tokenBalanceRepository.findByUserId.mockResolvedValue(existingBalance);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId });

      // Assert
      expect(result).toEqual(existingBalance);
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.create).not.toHaveBeenCalled();
    });

    it('should create new balance with 0 tokens for new user', async () => {
      // Arrange
      const userId = 'new-user-123';
      const userType = UserType.ARTIST;
      const userTypeId = 'artist-789';
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

      tokenBalanceRepository.findByUserId.mockResolvedValue(null);
      tokenBalanceRepository.create.mockResolvedValue(newBalance);

      // Act
      const result = await useCase.execute({ userId, userType, userTypeId });

      // Assert
      expect(result).toEqual(newBalance);
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
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'customer-456';
      const error = new Error('Database connection failed');

      tokenBalanceRepository.findByUserId.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute({ userId, userType, userTypeId })).rejects.toThrow(error);
      expect(tokenBalanceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(tokenBalanceRepository.create).not.toHaveBeenCalled();
    });
  });
});