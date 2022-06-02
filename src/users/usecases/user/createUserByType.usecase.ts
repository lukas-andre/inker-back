import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AgendaService } from '../../../agenda/domain/agenda.service';
import { ArtistsService } from '../../../artists/domain/services/artists.service';
import { CreateArtistDto } from '../../../artists/infrastructure/dtos/createArtist.dto';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { CreateArtistParams } from '../../../artists/usecases/interfaces/createArtist.params';
import { CustomersService } from '../../../customers/domain/customers.service';
import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
import { CreateCustomerParams } from '../../../customers/usecases/interfaces/createCustomer.params';
import { DomainException } from '../../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../../global/domain/guards/isServiceError.guard';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { ArtistLocationsService } from '../../../locations/domain/artistLocations.service';
import { ArtistLocation } from '../../../locations/infrastructure/entities/artistLocation.entity';
import { UserType } from '../../domain/enums/userType.enum';
import { RolesService } from '../../domain/services/roles.service';
import { UsersService } from '../../domain/services/users.service';

import { CreateUserByTypeParams } from './interfaces/createUserByType.params';

@Injectable()
export class CreateUserByTypeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly customerService: CustomersService,
    private readonly rolesService: RolesService,
    private readonly agendaService: AgendaService,
    private readonly artistLocationsService: ArtistLocationsService,
    private readonly configService: ConfigService,
  ) {
    super(CreateUserByTypeUseCase.name);
  }

  public async execute(
    createUserParams: CreateUserByTypeParams,
  ): Promise<Customer | Artist | DomainException> {
    const role = await this.rolesService.findOne({
      where: { name: createUserParams.userType.toLocaleLowerCase() },
    });

    if (!role) return new DomainConflictException('Role not exists');

    const created = await this.usersService.create(createUserParams, role);

    if (typeof created === 'boolean')
      return new DomainConflictException('User already exists');

    const response = await this.handleCreateByUserType(
      created.id,
      createUserParams,
    );

    return response instanceof DomainException
      ? this.handleCreateError(created.id, response)
      : response;
  }

  private async handleCreateByUserType(
    userId: number,
    dto: CreateUserByTypeParams,
  ): Promise<Customer | Artist | DomainException> {
    const createByType = {
      [UserType.CUSTOMER]: async () => {
        return this.createCustomer(
          this.mapParamsToCreateCustomerDto(userId, dto),
        );
      },
      [UserType.ARTIST]: async () => {
        return this.createArtist(
          this.mapParamsToCreateArtistParams(userId, dto),
        );
      },
    };

    return createByType[dto.userType]();
  }

  private async createArtist(createArtistDto: CreateArtistDto) {
    const artist = await this.artistsService.create(createArtistDto);

    if (isServiceError(artist))
      return new DomainConflictException(this.handleServiceError(artist));

    const agenda = await this.agendaService.createWithArtistDto(
      createArtistDto,
    );

    if (isServiceError(agenda)) {
      await this.artistsService.delete(artist.id);

      return new DomainConflictException(this.handleServiceError(agenda));
    }

    const artistLocation = await this.artistLocationsService.save(
      this.mapCreateArtistDtoToArtistLocation(artist, createArtistDto),
    );

    if (isServiceError(artistLocation)) {
      await this.agendaService.delete(agenda.id);

      return new DomainConflictException(
        this.handleServiceError(artistLocation),
      );
    }

    return artist;
  }

  private async createCustomer(createCustomerDto: CreateCustomerParams) {
    const result = await this.customerService.create(createCustomerDto);

    if (isServiceError(result))
      return new DomainConflictException(this.handleServiceError(result));

    return result;
  }

  private async rollbackCreate(userId: number) {
    await this.usersService.delete(userId);
  }

  private async handleCreateError(userId: number, error: DomainException) {
    await this.rollbackCreate(userId);

    return error;
  }

  private mapCreateArtistDtoToArtistLocation(
    artist: Artist,
    createArtistDto: CreateArtistDto,
  ): Partial<ArtistLocation> {
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
      location: {
        type: 'Point',
        coordinates: [
          createArtistDto.address.latitud,
          createArtistDto.address.longitud,
        ],
      },
    };
  }

  private mapParamsToCreateArtistParams(
    userId: number,
    dto: CreateUserByTypeParams,
  ): CreateArtistParams {
    return {
      userId,
      username: dto.username,
      phoneNumber: dto.phoneNumber,
      contactEmail: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      agendaIsOpen: dto.artistInfo.agendaIsOpen,
      agendaIsPublic: dto.artistInfo.agendaIsPublic,
      agendaWorkingDays: dto.artistInfo.agendaWorkingDays,
      address: dto.artistInfo.address,
    };
  }

  private mapParamsToCreateCustomerDto(
    userId: number,
    dto: CreateUserByTypeParams,
  ): CreateCustomerParams {
    return {
      userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      contactEmail: dto.email,
      phoneNumber: dto.phoneNumber,
    };
  }
}
