import { Test, TestingModule } from '@nestjs/testing';
import { SearchStencilsUseCase } from '../../../src/artists/usecases/stencil/search-stencils.usecase';
import { StencilProvider } from '../../../src/artists/infrastructure/database/stencil.provider';
import { InteractionProvider } from '../../../src/interactions/infrastructure/database/interaction.provider';
import { StencilSearchQueryDto } from '../../../src/artists/domain/dtos/stencil-search.dto';
import { PaginatedStencilResponseDto, StencilWithRelevanceDto } from '../../../src/artists/domain/dtos/paginated-stencil-response.dto';

describe('SearchStencilsUseCase', () => {
  let useCase: SearchStencilsUseCase;
  let stencilProvider: jest.Mocked<StencilProvider>;
  let interactionProvider: jest.Mocked<InteractionProvider>;

  beforeEach(async () => {
    // Create mock providers
    const stencilProviderMock = {
      searchStencils: jest.fn(),
    };

    const interactionProviderMock = {
      getRecentPopularEntities: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchStencilsUseCase,
        {
          provide: StencilProvider,
          useValue: stencilProviderMock,
        },
        {
          provide: InteractionProvider,
          useValue: interactionProviderMock,
        },
      ],
    }).compile();

    useCase = module.get<SearchStencilsUseCase>(SearchStencilsUseCase);
    stencilProvider = module.get(StencilProvider) as jest.Mocked<StencilProvider>;
    interactionProvider = module.get(InteractionProvider) as jest.Mocked<InteractionProvider>;
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated results', async () => {
      // Arrange
      const mockStencils = [
        { id: 1, title: 'Test Stencil 1', createdAt: new Date() },
        { id: 2, title: 'Test Stencil 2', createdAt: new Date() },
      ];
      const mockTotal = 2;
      stencilProvider.searchStencils.mockResolvedValue([mockStencils as any, mockTotal]);
      interactionProvider.getRecentPopularEntities.mockResolvedValue([]);

      const searchParams: StencilSearchQueryDto = {
        page: 1,
        limit: 10,
      };

      // Act
      const result = await useCase.execute(searchParams);

      // Assert
      expect(result).toBeDefined();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.pages).toBe(1);
    });

    it('should calculate proper relevance scores for exact title match', async () => {
      // Arrange
      const mockStencils = [
        { 
          id: 1, 
          title: 'Dragon tattoo', 
          description: 'A cool dragon tattoo', 
          createdAt: new Date(), 
          isAvailable: true 
        },
      ];
      const mockTotal = 1;
      stencilProvider.searchStencils.mockResolvedValue([mockStencils as any, mockTotal]);
      interactionProvider.getRecentPopularEntities.mockResolvedValue([]);

      const searchParams: StencilSearchQueryDto = {
        query: 'dragon',
        page: 1,
        limit: 10,
        sortBy: 'relevance',
      };

      // Act
      const result = await useCase.execute(searchParams);

      // Assert
      expect(result.items[0].relevanceScore).toBeGreaterThanOrEqual(0.8); // Base (0.5) + title match (0.3)
      expect(result.items[0].relevanceFactors).toContain('title_exact_match');
      expect(result.items[0].relevanceFactors).toContain('available');
    });

    it('should calculate proper relevance scores for partial title match', async () => {
      // Arrange
      const mockStencils = [
        { 
          id: 1, 
          title: 'Fantasy dragon design', 
          description: 'A fantasy dragon tattoo design', 
          createdAt: new Date(), 
          isAvailable: true 
        },
      ];
      const mockTotal = 1;
      stencilProvider.searchStencils.mockResolvedValue([mockStencils as any, mockTotal]);
      interactionProvider.getRecentPopularEntities.mockResolvedValue([]);

      const searchParams: StencilSearchQueryDto = {
        query: 'dragon tattoo',
        page: 1,
        limit: 10,
        sortBy: 'relevance',
      };

      // Act
      const result = await useCase.execute(searchParams);

      // Assert
      expect(result.items[0].relevanceFactors).toContain('title_partial_match');
      expect(result.items[0].relevanceFactors).toContain('description_match');
      expect(result.items[0].relevanceFactors).toContain('available');
    });

    it('should calculate proper relevance scores for recent stencils', async () => {
      // Arrange
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 20); // 20 days ago

      const mockStencils = [
        { 
          id: 1, 
          title: 'Recent dragon', 
          description: 'A recent dragon tattoo', 
          createdAt: thirtyDaysAgo, 
          isAvailable: true 
        },
      ];
      const mockTotal = 1;
      stencilProvider.searchStencils.mockResolvedValue([mockStencils as any, mockTotal]);
      interactionProvider.getRecentPopularEntities.mockResolvedValue([]);

      const searchParams: StencilSearchQueryDto = {
        query: 'dragon',
        page: 1,
        limit: 10,
        sortBy: 'relevance',
      };

      // Act
      const result = await useCase.execute(searchParams);

      // Assert
      expect(result.items[0].relevanceFactors).toContain('recent');
    });

    it('should include popularity factor when stencil has views', async () => {
      // Arrange
      const mockStencils = [
        { 
          id: 1, 
          title: 'Popular dragon', 
          description: 'A popular dragon tattoo', 
          createdAt: new Date(), 
          isAvailable: true 
        },
      ];
      const mockTotal = 1;
      stencilProvider.searchStencils.mockResolvedValue([mockStencils as any, mockTotal]);
      
      // Mock popularity data
      interactionProvider.getRecentPopularEntities.mockResolvedValue([
        { entityId: 1, count: 50 }
      ]);

      const searchParams: StencilSearchQueryDto = {
        query: 'dragon',
        page: 1,
        limit: 10,
        sortBy: 'relevance',
      };

      // Act
      const result = await useCase.execute(searchParams);

      // Assert
      expect(result.items[0].relevanceFactors).toContain('popular');
      // Popular items should get a higher score
      expect(result.items[0].relevanceScore).toBeGreaterThanOrEqual(0.9);
    });

    it('should sort by popularity when requested', async () => {
      // Arrange
      const mockStencils = [
        { id: 1, title: 'Less popular stencil', createdAt: new Date() },
        { id: 2, title: 'More popular stencil', createdAt: new Date() },
      ];
      const mockTotal = 2;
      stencilProvider.searchStencils.mockResolvedValue([mockStencils as any, mockTotal]);
      
      // Mock popularity data
      interactionProvider.getRecentPopularEntities.mockResolvedValue([
        { entityId: 2, count: 100 },
        { entityId: 1, count: 10 }
      ]);

      const searchParams: StencilSearchQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'popularity',
      };

      // Act
      const result = await useCase.execute(searchParams);

      // Assert
      // The first item should be the more popular one
      expect(result.items[0].title).toBe('More popular stencil');
      expect(result.items[0].relevanceFactors).toContain('popular');
    });
  });
}); 