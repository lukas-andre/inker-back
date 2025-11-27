import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InsufficientTokensError } from '../../../tokens/domain/errors/insufficient-tokens.error';
import { ConsumeTokensUseCase } from '../../../tokens/usecases/consume-tokens.usecase';
import { GetTokenBalanceUseCase } from '../../../tokens/usecases/get-token-balance.usecase';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { RunwareImageGenerationService } from '../../infrastructure/services/runwareImageGeneration.service';
import { TattooPromptEnhancementService } from '../../infrastructure/services/tattooPromptEnhancement.service';
import { GenerateTattooImagesUseCase } from '../generateTattooImages.usecase';
import { TattooDesignCacheRepository } from '../../infrastructure/database/repositories/tattooDesignCache.repository';

describe('GenerateTattooImagesUseCase', () => {
  let useCase: GenerateTattooImagesUseCase;
  let runwareService: jest.Mocked<RunwareImageGenerationService>;
  let promptEnhancementService: jest.Mocked<TattooPromptEnhancementService>;
  let cacheRepository: jest.Mocked<TattooDesignCacheRepository>;
  let consumeTokensUseCase: jest.Mocked<ConsumeTokensUseCase>;
  let getTokenBalanceUseCase: jest.Mocked<GetTokenBalanceUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateTattooImagesUseCase,
        {
          provide: RunwareImageGenerationService,
          useValue: {
            generateImages: jest.fn(),
          },
        },
        {
          provide: TattooPromptEnhancementService,
          useValue: {
            enhance: jest.fn(),
          },
        },
        {
          provide: TattooDesignCacheRepository,
          useValue: {
            findByCacheKey: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConsumeTokensUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetTokenBalanceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GenerateTattooImagesUseCase>(GenerateTattooImagesUseCase);
    runwareService = module.get(RunwareImageGenerationService);
    promptEnhancementService = module.get(TattooPromptEnhancementService);
    cacheRepository = module.get(TattooDesignCacheRepository);
    consumeTokensUseCase = module.get(ConsumeTokensUseCase);
    getTokenBalanceUseCase = module.get(GetTokenBalanceUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockUser = {
      id: 'user-123',
      type: UserType.CUSTOMER,
      typeId: 'customer-456',
    };

    const mockPromptData = {
      prompt: 'dragon tattoo',
      style: 'realistic',
      bodyPart: 'arm',
      color: 'black',
      additionalDetails: 'detailed scales',
    };

    const mockBalance = {
      id: 'balance-id',
      userId: mockUser.id,
      userType: mockUser.type,
      userTypeId: mockUser.typeId,
      balance: 5,
      totalPurchased: 10,
      totalConsumed: 5,
      totalGranted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return cached images without consuming tokens', async () => {
      // Arrange
      const cachedData = {
        id: 'cache-123',
        cacheKey: 'some-hash',
        images: [
          { imageUrl: 'https://example.com/image1.jpg', imageId: 'img-1' },
          { imageUrl: 'https://example.com/image2.jpg', imageId: 'img-2' },
        ],
        prompt: mockPromptData.prompt,
        enhancedPrompt: 'enhanced dragon tattoo',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      cacheRepository.findByCacheKey.mockResolvedValue(cachedData);
      getTokenBalanceUseCase.execute.mockResolvedValue(mockBalance);

      // Act
      const result = await useCase.execute(mockPromptData, mockUser);

      // Assert
      expect(result).toEqual({
        images: cachedData.images,
        generationId: cachedData.id,
        prompt: cachedData.enhancedPrompt,
        cachedResult: true,
        tokenBalance: 5,
        tokensConsumed: 0,
      });
      expect(consumeTokensUseCase.execute).not.toHaveBeenCalled();
      expect(runwareService.generateImages).not.toHaveBeenCalled();
      expect(getTokenBalanceUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
        userType: mockUser.type,
        userTypeId: mockUser.typeId,
      });
    });

    it('should generate new images and consume tokens when not cached', async () => {
      // Arrange
      const enhancedPrompt = 'ultra detailed dragon tattoo with scales';
      const generatedImages = [
        { imageUrl: 'https://example.com/new1.jpg', imageId: 'new-1', cost: 0.06 },
        { imageUrl: 'https://example.com/new2.jpg', imageId: 'new-2', cost: 0.06 },
      ];
      const savedCache = {
        id: 'new-cache-123',
        cacheKey: 'new-hash',
        images: generatedImages,
        prompt: mockPromptData.prompt,
        enhancedPrompt,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      cacheRepository.findByCacheKey.mockResolvedValue(null);
      promptEnhancementService.enhance.mockResolvedValue(enhancedPrompt);
      consumeTokensUseCase.execute.mockResolvedValue({
        success: true,
        newBalance: 4,
        transactionId: 'trans-123',
      });
      runwareService.generateImages.mockResolvedValue(generatedImages);
      cacheRepository.save.mockResolvedValue(savedCache);

      // Act
      const result = await useCase.execute(mockPromptData, mockUser);

      // Assert
      expect(result).toEqual({
        images: generatedImages,
        generationId: savedCache.id,
        prompt: enhancedPrompt,
        cachedResult: false,
        tokenBalance: 4,
        tokensConsumed: 1,
      });
      expect(consumeTokensUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
        userType: mockUser.type,
        userTypeId: mockUser.typeId,
        amount: 1,
        metadata: {
          tattooGenerationId: savedCache.id,
          prompt: mockPromptData.prompt,
          style: mockPromptData.style,
        },
      });
      expect(runwareService.generateImages).toHaveBeenCalledWith({
        prompt: enhancedPrompt,
        numberOfImages: 2,
        width: 512,
        height: 512,
      });
    });

    it('should throw InsufficientTokensError when user has no tokens', async () => {
      // Arrange
      cacheRepository.findByCacheKey.mockResolvedValue(null);
      promptEnhancementService.enhance.mockResolvedValue('enhanced prompt');
      consumeTokensUseCase.execute.mockRejectedValue(
        new InsufficientTokensError('Insufficient tokens: 0 available, 1 required')
      );

      // Act & Assert
      await expect(useCase.execute(mockPromptData, mockUser)).rejects.toThrow(InsufficientTokensError);
      expect(consumeTokensUseCase.execute).toHaveBeenCalled();
      expect(runwareService.generateImages).not.toHaveBeenCalled();
      expect(cacheRepository.save).not.toHaveBeenCalled();
    });

    it('should handle errors during image generation', async () => {
      // Arrange
      const enhancedPrompt = 'enhanced dragon tattoo';
      const error = new Error('Runware API error');

      cacheRepository.findByCacheKey.mockResolvedValue(null);
      promptEnhancementService.enhance.mockResolvedValue(enhancedPrompt);
      consumeTokensUseCase.execute.mockResolvedValue({
        success: true,
        newBalance: 4,
        transactionId: 'trans-123',
      });
      runwareService.generateImages.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(mockPromptData, mockUser)).rejects.toThrow(error);
      expect(consumeTokensUseCase.execute).toHaveBeenCalled();
      expect(runwareService.generateImages).toHaveBeenCalled();
      expect(cacheRepository.save).not.toHaveBeenCalled();
    });

    it('should handle user without proper data', async () => {
      // Arrange
      const invalidUser = { id: null, type: null, typeId: null };

      // Act & Assert
      await expect(useCase.execute(mockPromptData, invalidUser as any)).rejects.toThrow();
      expect(consumeTokensUseCase.execute).not.toHaveBeenCalled();
      expect(runwareService.generateImages).not.toHaveBeenCalled();
    });

    it('should include all metadata in token consumption', async () => {
      // Arrange
      const enhancedPrompt = 'enhanced dragon tattoo';
      const generatedImages = [{ imageUrl: 'https://example.com/img.jpg', imageId: 'img-1' }];
      const savedCache = {
        id: 'gen-456',
        cacheKey: 'hash-456',
        images: generatedImages,
        prompt: mockPromptData.prompt,
        enhancedPrompt,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      cacheRepository.findByCacheKey.mockResolvedValue(null);
      promptEnhancementService.enhance.mockResolvedValue(enhancedPrompt);
      consumeTokensUseCase.execute.mockResolvedValue({
        success: true,
        newBalance: 9,
        transactionId: 'trans-456',
      });
      runwareService.generateImages.mockResolvedValue(generatedImages);
      cacheRepository.save.mockResolvedValue(savedCache);

      // Act
      await useCase.execute(mockPromptData, mockUser);

      // Assert
      expect(consumeTokensUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
        userType: mockUser.type,
        userTypeId: mockUser.typeId,
        amount: 1,
        metadata: {
          tattooGenerationId: savedCache.id,
          prompt: mockPromptData.prompt,
          style: mockPromptData.style,
        },
      });
    });

    it('should handle concurrent requests with same prompt', async () => {
      // Arrange
      const enhancedPrompt = 'enhanced dragon tattoo';
      const generatedImages = [{ imageUrl: 'https://example.com/img.jpg', imageId: 'img-1' }];
      const savedCache = {
        id: 'gen-789',
        cacheKey: 'hash-789',
        images: generatedImages,
        prompt: mockPromptData.prompt,
        enhancedPrompt,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First call finds no cache
      cacheRepository.findByCacheKey.mockResolvedValueOnce(null);
      // Second call (concurrent) also finds no cache initially
      cacheRepository.findByCacheKey.mockResolvedValueOnce(null);
      
      promptEnhancementService.enhance.mockResolvedValue(enhancedPrompt);
      consumeTokensUseCase.execute.mockResolvedValue({
        success: true,
        newBalance: 3,
        transactionId: 'trans-789',
      });
      runwareService.generateImages.mockResolvedValue(generatedImages);
      cacheRepository.save.mockResolvedValue(savedCache);

      // Act - Simulate concurrent requests
      const [result1, result2] = await Promise.all([
        useCase.execute(mockPromptData, mockUser),
        useCase.execute(mockPromptData, mockUser),
      ]);

      // Assert - Both should get results but tokens consumed twice (race condition)
      expect(result1.tokensConsumed).toBe(1);
      expect(result2.tokensConsumed).toBe(1);
      expect(consumeTokensUseCase.execute).toHaveBeenCalledTimes(2);
    });
  });
});