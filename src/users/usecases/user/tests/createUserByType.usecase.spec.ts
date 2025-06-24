import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AgendaRepository } from '../../../../agenda/infrastructure/repositories/agenda.repository';
import { ArtistRepository } from '../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../customers/infrastructure/providers/customer.repository';
import { DomainConflict } from '../../../../global/domain/exceptions/domain.exception';
import { ArtistLocationRepository } from '../../../../locations/infrastructure/database/artistLocation.repository';
import { GrantTokensUseCase } from '../../../../tokens/usecases/grant-tokens.usecase';
import { UserType } from '../../../domain/enums/userType.enum';
import { RolesRepository } from '../../../infrastructure/repositories/roles.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { CreateUserByTypeUseCase } from '../createUserByType.usecase';

describe('CreateUserByTypeUseCase', () => {
  let useCase: CreateUserByTypeUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;
  let artistRepository: jest.Mocked<ArtistRepository>;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let rolesRepository: jest.Mocked<RolesRepository>;
  let agendaRepository: jest.Mocked<AgendaRepository>;
  let artistLocationRepository: jest.Mocked<ArtistLocationRepository>;
  let grantTokensUseCase: jest.Mocked<GrantTokensUseCase>;
  let configService: jest.Mocked<ConfigService>;

  const mockCreateUserParams = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'securePassword123',
    firstName: 'Test',
    lastName: 'User',
    phoneNumberDetails: {
      countryCode: 'US',
      dialCode: '+1',
      number: '1234567890',
    },
    userType: UserType.CUSTOMER,
  };

  const mockArtistParams = {
    ...mockCreateUserParams,
    userType: UserType.ARTIST,
    artistInfo: {
      agendaIsOpen: true,
      agendaIsPublic: true,
      agendaWorkingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      address: {
        address1: '123 Main St',
        shortAddress1: '123 Main',
        address2: 'Suite 100',
        address3: '',
        addressType: 'business',
        city: 'New York',
        country: 'US',
        state: 'NY',
        formattedAddress: '123 Main St, Suite 100, New York, NY',
        googlePlaceId: 'place-123',
        geometry: {
          location: {
            lat: 40.7128,
            lng: -74.0060,
          },
          viewport: {
            northeast: { lat: 40.7138, lng: -74.0050 },
            southwest: { lat: 40.7118, lng: -74.0070 },
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserByTypeUseCase,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ArtistRepository,
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CustomerRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: RolesRepository,
          useValue: {
            exists: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: AgendaRepository,
          useValue: {
            createWithArtistInfo: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ArtistLocationRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: GrantTokensUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateUserByTypeUseCase>(CreateUserByTypeUseCase);
    usersRepository = module.get(UsersRepository);
    artistRepository = module.get(ArtistRepository);
    customerRepository = module.get(CustomerRepository);
    rolesRepository = module.get(RolesRepository);
    agendaRepository = module.get(AgendaRepository);
    artistLocationRepository = module.get(ArtistLocationRepository);
    grantTokensUseCase = module.get(GrantTokensUseCase);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Customer Creation with Welcome Tokens', () => {
    it('should create customer and grant welcome tokens successfully', async () => {
      // Arrange
      const mockRole = { id: 'role-123', name: 'customer' };
      const mockUser = { id: 'user-123', ...mockCreateUserParams };
      const mockCustomer = {
        id: 'customer-456',
        userId: 'user-123',
        firstName: mockCreateUserParams.firstName,
        lastName: mockCreateUserParams.lastName,
        contactEmail: mockCreateUserParams.email,
      };

      rolesRepository.exists.mockResolvedValue(true);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      usersRepository.create.mockResolvedValue(mockUser);
      customerRepository.create.mockResolvedValue(mockCustomer);
      configService.get.mockReturnValue(3); // 3 welcome tokens
      grantTokensUseCase.execute.mockResolvedValue({
        success: true,
        newBalance: 3,
        transactionId: 'trans-123',
      });

      // Act
      const result = await useCase.execute(mockCreateUserParams);

      // Assert
      expect(result).toBeDefined();
      expect(rolesRepository.exists).toHaveBeenCalledWith('customer');
      expect(usersRepository.create).toHaveBeenCalledWith(mockCreateUserParams, mockRole);
      expect(customerRepository.create).toHaveBeenCalled();
      expect(grantTokensUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        userType: UserType.CUSTOMER,
        userTypeId: 'customer-456',
        amount: 3,
        reason: 'Bono de bienvenida - Registro nuevo usuario',
        metadata: {
          promotionType: 'WELCOME_BONUS',
          registrationDate: expect.any(Date),
        },
      });
    });

    it('should create customer even if token grant fails', async () => {
      // Arrange
      const mockRole = { id: 'role-123', name: 'customer' };
      const mockUser = { id: 'user-123', ...mockCreateUserParams };
      const mockCustomer = {
        id: 'customer-456',
        userId: 'user-123',
        firstName: mockCreateUserParams.firstName,
        lastName: mockCreateUserParams.lastName,
        contactEmail: mockCreateUserParams.email,
      };

      rolesRepository.exists.mockResolvedValue(true);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      usersRepository.create.mockResolvedValue(mockUser);
      customerRepository.create.mockResolvedValue(mockCustomer);
      configService.get.mockReturnValue(3);
      grantTokensUseCase.execute.mockRejectedValue(new Error('Token service unavailable'));

      // Act
      const result = await useCase.execute(mockCreateUserParams);

      // Assert
      expect(result).toBeDefined();
      expect(customerRepository.create).toHaveBeenCalled();
      expect(grantTokensUseCase.execute).toHaveBeenCalled();
      expect(usersRepository.delete).not.toHaveBeenCalled(); // User not rolled back
    });

    it('should not grant tokens if welcome bonus is 0', async () => {
      // Arrange
      const mockRole = { id: 'role-123', name: 'customer' };
      const mockUser = { id: 'user-123', ...mockCreateUserParams };
      const mockCustomer = {
        id: 'customer-456',
        userId: 'user-123',
        firstName: mockCreateUserParams.firstName,
        lastName: mockCreateUserParams.lastName,
        contactEmail: mockCreateUserParams.email,
      };

      rolesRepository.exists.mockResolvedValue(true);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      usersRepository.create.mockResolvedValue(mockUser);
      customerRepository.create.mockResolvedValue(mockCustomer);
      configService.get.mockReturnValue(0); // No welcome tokens

      // Act
      const result = await useCase.execute(mockCreateUserParams);

      // Assert
      expect(result).toBeDefined();
      expect(grantTokensUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('Artist Creation with Welcome Tokens', () => {
    it('should create artist with agenda and location, then grant welcome tokens', async () => {
      // Arrange
      const mockRole = { id: 'role-456', name: 'artist' };
      const mockUser = { id: 'user-789', ...mockArtistParams };
      const mockArtist = {
        id: 'artist-123',
        userId: 'user-789',
        firstName: mockArtistParams.firstName,
        lastName: mockArtistParams.lastName,
        contactEmail: mockArtistParams.email,
        profileThumbnail: null,
      };
      const mockAgenda = { id: 'agenda-123', artistId: 'artist-123' };
      const mockLocation = { id: 'location-123', artistId: 'artist-123' };

      rolesRepository.exists.mockResolvedValue(true);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      usersRepository.create.mockResolvedValue(mockUser);
      artistRepository.create.mockResolvedValue(mockArtist);
      agendaRepository.createWithArtistInfo.mockResolvedValue(mockAgenda);
      artistLocationRepository.save.mockResolvedValue(mockLocation);
      configService.get.mockReturnValue(5); // 5 welcome tokens for artists
      grantTokensUseCase.execute.mockResolvedValue({
        success: true,
        newBalance: 5,
        transactionId: 'trans-456',
      });

      // Act
      const result = await useCase.execute(mockArtistParams);

      // Assert
      expect(result).toBeDefined();
      expect(artistRepository.create).toHaveBeenCalled();
      expect(agendaRepository.createWithArtistInfo).toHaveBeenCalled();
      expect(artistLocationRepository.save).toHaveBeenCalled();
      expect(grantTokensUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-789',
        userType: UserType.ARTIST,
        userTypeId: 'artist-123',
        amount: 5,
        reason: 'Bono de bienvenida - Registro nuevo usuario',
        metadata: {
          promotionType: 'WELCOME_BONUS',
          registrationDate: expect.any(Date),
        },
      });
    });

    it('should rollback artist creation if agenda creation fails', async () => {
      // Arrange
      const mockRole = { id: 'role-456', name: 'artist' };
      const mockUser = { id: 'user-789', ...mockArtistParams };
      const mockArtist = {
        id: 'artist-123',
        userId: 'user-789',
        firstName: mockArtistParams.firstName,
        lastName: mockArtistParams.lastName,
        contactEmail: mockArtistParams.email,
      };

      rolesRepository.exists.mockResolvedValue(true);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      usersRepository.create.mockResolvedValue(mockUser);
      artistRepository.create.mockResolvedValue(mockArtist);
      agendaRepository.createWithArtistInfo.mockRejectedValue(new Error('Agenda creation failed'));

      // Act & Assert
      await expect(useCase.execute(mockArtistParams)).rejects.toThrow();
      expect(artistRepository.delete).toHaveBeenCalledWith('artist-123');
      expect(usersRepository.delete).toHaveBeenCalledWith('user-789');
      expect(grantTokensUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw DomainConflict if role does not exist', async () => {
      // Arrange
      rolesRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(mockCreateUserParams)).rejects.toThrow(DomainConflict);
      expect(usersRepository.create).not.toHaveBeenCalled();
      expect(grantTokensUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle missing GrantTokensUseCase gracefully', async () => {
      // Arrange
      const moduleWithoutTokens: TestingModule = await Test.createTestingModule({
        providers: [
          CreateUserByTypeUseCase,
          {
            provide: UsersRepository,
            useValue: usersRepository,
          },
          {
            provide: ArtistRepository,
            useValue: artistRepository,
          },
          {
            provide: CustomerRepository,
            useValue: customerRepository,
          },
          {
            provide: RolesRepository,
            useValue: rolesRepository,
          },
          {
            provide: AgendaRepository,
            useValue: agendaRepository,
          },
          {
            provide: ArtistLocationRepository,
            useValue: artistLocationRepository,
          },
          {
            provide: ConfigService,
            useValue: configService,
          },
          // No GrantTokensUseCase provided
        ],
      }).compile();

      const useCaseWithoutTokens = moduleWithoutTokens.get<CreateUserByTypeUseCase>(CreateUserByTypeUseCase);

      const mockRole = { id: 'role-123', name: 'customer' };
      const mockUser = { id: 'user-123', ...mockCreateUserParams };
      const mockCustomer = {
        id: 'customer-456',
        userId: 'user-123',
        firstName: mockCreateUserParams.firstName,
        lastName: mockCreateUserParams.lastName,
        contactEmail: mockCreateUserParams.email,
      };

      rolesRepository.exists.mockResolvedValue(true);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      usersRepository.create.mockResolvedValue(mockUser);
      customerRepository.create.mockResolvedValue(mockCustomer);

      // Act
      const result = await useCaseWithoutTokens.execute(mockCreateUserParams);

      // Assert
      expect(result).toBeDefined();
      expect(customerRepository.create).toHaveBeenCalled();
      // No token grant attempted
    });
  });

  describe('Configuration', () => {
    it('should use default welcome bonus if config not set', async () => {
      // Arrange
      const mockRole = { id: 'role-123', name: 'customer' };
      const mockUser = { id: 'user-123', ...mockCreateUserParams };
      const mockCustomer = {
        id: 'customer-456',
        userId: 'user-123',
        firstName: mockCreateUserParams.firstName,
        lastName: mockCreateUserParams.lastName,
        contactEmail: mockCreateUserParams.email,
      };

      rolesRepository.exists.mockResolvedValue(true);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      usersRepository.create.mockResolvedValue(mockUser);
      customerRepository.create.mockResolvedValue(mockCustomer);
      configService.get.mockImplementation((key, defaultValue) => defaultValue); // Return default
      grantTokensUseCase.execute.mockResolvedValue({
        success: true,
        newBalance: 3,
        transactionId: 'trans-123',
      });

      // Act
      await useCase.execute(mockCreateUserParams);

      // Assert
      expect(configService.get).toHaveBeenCalledWith('TOKENS_WELCOME_BONUS', 3);
      expect(grantTokensUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 3, // Default value
        })
      );
    });
  });
});