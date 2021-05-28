import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateArtistDto } from '../../../artists/infrastructure/dtos/createArtist.dto';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { ArtistsService } from '../../../artists/domain/services/artists.service';
import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
import { CustomersService } from '../../../customers/domain/customers.service';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { handleServiceError } from '../../../global/domain/utils/handleServiceError';
import { UserType } from '../../domain/enums/userType.enum';
import { RolesService } from '../../domain/services/roles.service';
import { UsersService } from '../../domain/services/users.service';
import { CreateUserByTypeParams } from './interfaces/createUserByType.params';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { CreateCustomerParams } from '../../../customers/usecases/interfaces/createCustomer.params';
import { AgendaService } from '../../../agenda/domain/agenda.service';
import { ArtistLocationsService } from '../../../locations/domain/artistLocations.service';
import { ArtistLocation } from '../../../locations/infrastructure/entities/artistLocation.entity';
import { Agenda } from '../../../agenda/intrastructure/entities/agenda.entity';
import { Point } from 'geojson';
import { isServiceError } from 'src/global/domain/guards/isServiceError.guard';
@Injectable()
export class CreateUserByTypeUseCase {
  private readonly serviceName = CreateUserByTypeUseCase.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly customerService: CustomersService,
    private readonly rolesService: RolesService,
    private readonly agendaService: AgendaService,
    private readonly artistLocationsService: ArtistLocationsService,
    private readonly configService: ConfigService,
  ) {}

  async execute(createUserParams: CreateUserByTypeParams) {
    const role = await this.rolesService.findOne({
      where: { name: createUserParams.userType.toLocaleLowerCase() },
    });

    if (!role) {
      return new DomainConflictException('Role not exists');
    }

    const created = await this.usersService.create(createUserParams, role);
    if (typeof created == 'boolean') {
      return new DomainConflictException('User already exists');
    }

    const response = await this.handleCreateByUserType(
      created.id,
      createUserParams,
    );

    if (isServiceError(response)) {
      return this.handleCreateError(created.id, response);
    }

    return created;
  }

  private async handleCreateByUserType(
    userId: number,
    dto: CreateUserByTypeParams,
  ): Promise<Customer | Artist | ServiceError> {
    const createByType = {
      [UserType.CUSTOMER]: async () => {
        const createCustomerDto = Object.assign(new CreateCustomerParams(), {
          ...dto,
          contactEmail: dto.email ? dto.email : undefined,
          userId,
        });
        return this.createCustomer(createCustomerDto);
      },
      [UserType.ARTIST]: async () => {
        const createArtistDto = Object.assign(new CreateArtistDto(), {
          ...dto,
          contactEmail: dto.email ? dto.email : undefined,
          userId,
        });
        return this.createArtist(createArtistDto);
      },
    };
    return createByType[dto.userType]();
  }

  private async createArtist(createArtistDto: CreateArtistDto) {
    const result = await this.artistsService.create(createArtistDto);

    const savedAgenda = await this.agendaService.createWithArtistDto(
      createArtistDto,
    );

    if (savedAgenda instanceof ServiceError && result instanceof Artist) {
      await this.artistsService.delete(result.id);
    }

    const artistLocation: Partial<ArtistLocation> =
      this.mapCreateArtistDtoToArtistLocation(
        result as Artist,
        createArtistDto,
      );

    const savedLocation = await this.artistLocationsService.save(
      artistLocation,
    );

    if (
      savedLocation instanceof ServiceError &&
      result instanceof Artist &&
      savedAgenda instanceof Agenda
    ) {
      await this.artistsService.delete(result.id);
      await this.agendaService.delete(savedAgenda.id);
    }

    return result;
  }

  private mapCreateArtistDtoToArtistLocation(
    artist: Artist,
    createArtistDto: CreateArtistDto,
  ): Partial<ArtistLocation> {
    const point: Point = {
      type: 'Point',
      coordinates: [
        createArtistDto.address.latitud,
        createArtistDto.address.longitud,
      ],
    };
    return {
      artistId: artist.id,
      name: [artist.firstName, artist.lastName].join(' '),
      profileThumbnail: artist.profileThumbnail,
      address1: createArtistDto.address.address1,
      address2: createArtistDto.address.address2,
      address3: createArtistDto.address.address3,
      city: createArtistDto.address.city,
      country: createArtistDto.address.country,
      state: createArtistDto.address.state,
      latitud: createArtistDto.address.latitud,
      longitud: createArtistDto.address.longitud,
      location: point,
    };
  }

  private async createCustomer(createCustomerDto: CreateCustomerParams) {
    const result = await this.customerService.create(createCustomerDto);
    return result;
  }

  private async rollbackCreate(userId: number) {
    await this.usersService.delete(userId);
  }

  private async handleCreateError(userId: number, error: ServiceError) {
    await this.rollbackCreate(userId);
    return new DomainConflictException(handleServiceError(error, this.logger));
  }
}
