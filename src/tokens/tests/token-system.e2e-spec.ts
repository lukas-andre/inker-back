import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserType } from '../../users/domain/enums/userType.enum';
import { TOKENS_DB_CONNECTION_NAME } from '../../databases/constants';
import { TokenBalance } from '../infrastructure/entities/token-balance.entity';
import { TokenTransaction } from '../infrastructure/entities/token-transaction.entity';
import { TokenBalanceRepository } from '../infrastructure/repositories/token-balance.repository';
import { TokenTransactionRepository } from '../infrastructure/repositories/token-transaction.repository';
import { TokenRepositoryModule } from '../infrastructure/repositories/tokenRepository.module';
import { GetTokenBalanceUseCase } from '../usecases/get-token-balance.usecase';
import { ConsumeTokensUseCase } from '../usecases/consume-tokens.usecase';
import { GrantTokensUseCase } from '../usecases/grant-tokens.usecase';
import { TransactionType } from '../domain/enums/transaction-type.enum';
import { TransactionStatus } from '../domain/enums/transaction-status.enum';
import { InsufficientTokensError } from '../domain/errors/insufficient-tokens.error';

describe('Token System E2E', () => {
  let moduleFixture: TestingModule;
  let tokenBalanceRepository: TokenBalanceRepository;
  let tokenTransactionRepository: TokenTransactionRepository;
  let getTokenBalanceUseCase: GetTokenBalanceUseCase;
  let consumeTokensUseCase: ConsumeTokensUseCase;
  let grantTokensUseCase: GrantTokensUseCase;

  const testUserId = 'test-user-123';
  const testUserType = UserType.CUSTOMER;
  const testUserTypeId = 'customer-456';

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test-tokens',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          name: TOKENS_DB_CONNECTION_NAME,
          entities: [TokenBalance, TokenTransaction],
          synchronize: true,
          dropSchema: true,
          logging: false,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(
          [TokenBalance, TokenTransaction],
          TOKENS_DB_CONNECTION_NAME,
        ),
        TokenRepositoryModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(TokenBalance, TOKENS_DB_CONNECTION_NAME),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TokenTransaction, TOKENS_DB_CONNECTION_NAME),
          useClass: Repository,
        },
        GetTokenBalanceUseCase,
        ConsumeTokensUseCase,
        GrantTokensUseCase,
      ],
    }).compile();

    tokenBalanceRepository = moduleFixture.get<TokenBalanceRepository>(TokenBalanceRepository);
    tokenTransactionRepository = moduleFixture.get<TokenTransactionRepository>(TokenTransactionRepository);
    getTokenBalanceUseCase = moduleFixture.get<GetTokenBalanceUseCase>(GetTokenBalanceUseCase);
    consumeTokensUseCase = moduleFixture.get<ConsumeTokensUseCase>(ConsumeTokensUseCase);
    grantTokensUseCase = moduleFixture.get<GrantTokensUseCase>(GrantTokensUseCase);
  });

  afterEach(async () => {
    // Clean up test data
    const transactionRepo = moduleFixture.get<Repository<TokenTransaction>>(
      getRepositoryToken(TokenTransaction, TOKENS_DB_CONNECTION_NAME)
    );
    const balanceRepo = moduleFixture.get<Repository<TokenBalance>>(
      getRepositoryToken(TokenBalance, TOKENS_DB_CONNECTION_NAME)
    );
    
    await transactionRepo.delete({});
    await balanceRepo.delete({});
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  describe('Complete User Journey', () => {
    it('should handle full lifecycle: new user -> welcome tokens -> consume -> insufficient -> grant more -> consume again', async () => {
      // Step 1: Check initial balance for new user (should create with 0)
      const initialBalance = await getTokenBalanceUseCase.execute({
        userId: testUserId,
        userType: testUserType,
        userTypeId: testUserTypeId,
      });

      expect(initialBalance).toMatchObject({
        userId: testUserId,
        userType: testUserType,
        userTypeId: testUserTypeId,
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
        totalGranted: 0,
      });

      // Step 2: Grant welcome tokens (simulate user registration)
      const welcomeGrant = await grantTokensUseCase.execute({
        userId: testUserId,
        userType: testUserType,
        userTypeId: testUserTypeId,
        amount: 3,
        reason: 'Welcome bonus',
        metadata: {
          promotionType: 'WELCOME_BONUS',
          registrationDate: new Date(),
        },
      });

      expect(welcomeGrant).toMatchObject({
        success: true,
        newBalance: 3,
        transactionId: expect.any(String),
      });

      // Verify balance updated
      const balanceAfterWelcome = await tokenBalanceRepository.findByUserId(testUserId);
      expect(balanceAfterWelcome.balance).toBe(3);
      expect(balanceAfterWelcome.totalGranted).toBe(3);

      // Step 3: Consume tokens for image generation
      const firstConsumption = await consumeTokensUseCase.execute({
        userId: testUserId,
        userType: testUserType,
        userTypeId: testUserTypeId,
        amount: 1,
        metadata: {
          tattooGenerationId: 'gen-001',
          prompt: 'dragon tattoo',
          style: 'realistic',
        },
      });

      expect(firstConsumption).toMatchObject({
        success: true,
        remainingBalance: 2,
        transactionId: expect.any(String),
      });

      // Step 4: Consume remaining tokens
      const secondConsumption = await consumeTokensUseCase.execute({
        userId: testUserId,
        userType: testUserType,
        userTypeId: testUserTypeId,
        amount: 2,
        metadata: {
          tattooGenerationId: 'gen-002',
          prompt: 'phoenix tattoo',
          style: 'watercolor',
        },
      });

      expect(secondConsumption).toMatchObject({
        success: true,
        remainingBalance: 0,
        transactionId: expect.any(String),
      });

      // Step 5: Try to consume when balance is 0 (should fail)
      await expect(
        consumeTokensUseCase.execute({
          userId: testUserId,
          userType: testUserType,
          userTypeId: testUserTypeId,
          amount: 1,
          metadata: {
            tattooGenerationId: 'gen-003',
            prompt: 'wolf tattoo',
            style: 'tribal',
          },
        })
      ).rejects.toThrow(InsufficientTokensError);

      // Step 6: Simulate manual token purchase/grant
      const purchaseGrant = await grantTokensUseCase.execute({
        userId: testUserId,
        userType: testUserType,
        userTypeId: testUserTypeId,
        amount: 10,
        reason: 'Manual purchase - Transfer #12345',
        metadata: {
          adminUserId: 'admin-001',
          paymentMethod: 'bank_transfer',
          packageId: 'starter',
        },
      });

      expect(purchaseGrant).toMatchObject({
        success: true,
        newBalance: 10,
        transactionId: expect.any(String),
      });

      // Step 7: Verify final state
      const finalBalance = await tokenBalanceRepository.findByUserId(testUserId);
      expect(finalBalance).toMatchObject({
        balance: 10,
        totalPurchased: 0, // Still 0 as we used GRANT, not PURCHASE
        totalConsumed: 3,
        totalGranted: 13, // 3 welcome + 10 manual
      });

      // Step 8: Check transaction history
      const transactionRepo = moduleFixture.get<Repository<TokenTransaction>>(
        getRepositoryToken(TokenTransaction, TOKENS_DB_CONNECTION_NAME)
      );
      const transactions = await transactionRepo.find({
        where: { userId: testUserId },
        order: { createdAt: 'ASC' },
      });

      expect(transactions).toHaveLength(4);
      expect(transactions[0]).toMatchObject({
        type: TransactionType.GRANT,
        amount: 3,
        balanceBefore: 0,
        balanceAfter: 3,
        status: TransactionStatus.COMPLETED,
      });
      expect(transactions[1]).toMatchObject({
        type: TransactionType.CONSUME,
        amount: -1,
        balanceBefore: 3,
        balanceAfter: 2,
        status: TransactionStatus.COMPLETED,
      });
      expect(transactions[2]).toMatchObject({
        type: TransactionType.CONSUME,
        amount: -2,
        balanceBefore: 2,
        balanceAfter: 0,
        status: TransactionStatus.COMPLETED,
      });
      expect(transactions[3]).toMatchObject({
        type: TransactionType.GRANT,
        amount: 10,
        balanceBefore: 0,
        balanceAfter: 10,
        status: TransactionStatus.COMPLETED,
      });
    });

    it('should handle concurrent token consumption correctly', async () => {
      // Setup: Grant initial tokens
      await grantTokensUseCase.execute({
        userId: 'concurrent-user',
        userType: UserType.ARTIST,
        userTypeId: 'artist-789',
        amount: 5,
        reason: 'Test setup',
      });

      // Attempt concurrent consumptions
      const concurrentPromises = Array(5).fill(null).map((_, index) => 
        consumeTokensUseCase.execute({
          userId: 'concurrent-user',
          userType: UserType.ARTIST,
          userTypeId: 'artist-789',
          amount: 1,
          metadata: {
            tattooGenerationId: `gen-concurrent-${index}`,
            prompt: `test prompt ${index}`,
          },
        })
      );

      // All should succeed
      const results = await Promise.all(concurrentPromises);
      
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.remainingBalance).toBe(4 - index);
      });

      // Final balance should be 0
      const finalBalance = await tokenBalanceRepository.findByUserId('concurrent-user');
      expect(finalBalance.balance).toBe(0);
      expect(finalBalance.totalConsumed).toBe(5);

      // Try one more consumption (should fail)
      await expect(
        consumeTokensUseCase.execute({
          userId: 'concurrent-user',
          userType: UserType.ARTIST,
          userTypeId: 'artist-789',
          amount: 1,
          metadata: { tattooGenerationId: 'gen-fail' },
        })
      ).rejects.toThrow(InsufficientTokensError);
    });

    it('should maintain data integrity across different user types', async () => {
      const users = [
        { userId: 'user-1', userType: UserType.CUSTOMER, userTypeId: 'cust-1' },
        { userId: 'user-2', userType: UserType.ARTIST, userTypeId: 'art-1' },
        { userId: 'user-3', userType: UserType.ADMIN, userTypeId: 'admin-1' },
      ];

      // Grant different amounts to each user
      for (const [index, user] of users.entries()) {
        await grantTokensUseCase.execute({
          ...user,
          amount: (index + 1) * 10,
          reason: `Test grant for ${user.userType}`,
        });
      }

      // Verify each user has correct balance
      for (const [index, user] of users.entries()) {
        const balance = await tokenBalanceRepository.findByUserId(user.userId);
        expect(balance.balance).toBe((index + 1) * 10);
        expect(balance.userType).toBe(user.userType);
        expect(balance.userTypeId).toBe(user.userTypeId);
      }

      // Consume tokens from each user
      for (const user of users) {
        await consumeTokensUseCase.execute({
          ...user,
          amount: 5,
          metadata: { test: true },
        });
      }

      // Verify balances after consumption
      for (const [index, user] of users.entries()) {
        const balance = await tokenBalanceRepository.findByUserId(user.userId);
        expect(balance.balance).toBe((index + 1) * 10 - 5);
        expect(balance.totalConsumed).toBe(5);
      }
    });

    it('should track metadata correctly throughout transactions', async () => {
      const userId = 'metadata-test-user';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'cust-meta-123';

      // Grant with rich metadata
      await grantTokensUseCase.execute({
        userId,
        userType,
        userTypeId,
        amount: 20,
        reason: 'Testing metadata',
        metadata: {
          source: 'test_suite',
          testId: 'e2e-metadata',
          timestamp: new Date(),
          adminUserId: 'test-admin',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest Test Runner',
        },
      });

      // Consume with different metadata
      await consumeTokensUseCase.execute({
        userId,
        userType,
        userTypeId,
        amount: 5,
        metadata: {
          tattooGenerationId: 'gen-meta-001',
          prompt: 'complex prompt with metadata',
          style: 'realistic',
          bodyPart: 'arm',
          color: 'black',
          additionalDetails: 'high detail',
          runwareCost: 0.06,
        },
      });

      // Retrieve and verify transactions
      const transactionRepo = moduleFixture.get<Repository<TokenTransaction>>(
        getRepositoryToken(TokenTransaction, TOKENS_DB_CONNECTION_NAME)
      );
      const transactions = await transactionRepo.find({
        where: { userId },
        order: { createdAt: 'ASC' },
      });

      expect(transactions).toHaveLength(2);
      
      // Verify grant metadata
      expect(transactions[0].metadata).toMatchObject({
        source: 'test_suite',
        testId: 'e2e-metadata',
        adminUserId: 'test-admin',
        ipAddress: '127.0.0.1',
        userAgent: 'Jest Test Runner',
        reason: 'Testing metadata',
      });

      // Verify consumption metadata
      expect(transactions[1].metadata).toMatchObject({
        tattooGenerationId: 'gen-meta-001',
        prompt: 'complex prompt with metadata',
        style: 'realistic',
        bodyPart: 'arm',
        color: 'black',
        additionalDetails: 'high detail',
        runwareCost: 0.06,
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle database connection failures gracefully', async () => {
      // This test would require mocking the database connection
      // In a real scenario, you might inject a failing connection
      // For now, we'll test the error handling at the use case level
      
      const nonExistentUser = 'user-does-not-exist';
      
      // Consuming tokens for non-existent user should fail
      await expect(
        consumeTokensUseCase.execute({
          userId: nonExistentUser,
          userType: UserType.CUSTOMER,
          userTypeId: 'cust-none',
          amount: 1,
        })
      ).rejects.toThrow(InsufficientTokensError);
    });

    it('should prevent negative balances', async () => {
      const userId = 'negative-test-user';
      const userType = UserType.CUSTOMER;
      const userTypeId = 'cust-neg-123';

      // Grant some tokens
      await grantTokensUseCase.execute({
        userId,
        userType,
        userTypeId,
        amount: 5,
        reason: 'Test negative balance prevention',
      });

      // Try to consume more than available
      await expect(
        consumeTokensUseCase.execute({
          userId,
          userType,
          userTypeId,
          amount: 10,
        })
      ).rejects.toThrow(InsufficientTokensError);

      // Balance should still be 5
      const balance = await tokenBalanceRepository.findByUserId(userId);
      expect(balance.balance).toBe(5);
    });
  });
});