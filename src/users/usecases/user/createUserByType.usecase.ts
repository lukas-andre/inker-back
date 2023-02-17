import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import stringify from 'fast-safe-stringify';

import { Agenda } from '../../../agenda/infrastructure/entities/agenda.entity';
import { AgendaProvider } from '../../../agenda/infrastructure/providers/agenda.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CreateArtistDto } from '../../../artists/infrastructure/dtos/createArtist.dto';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { CreateArtistParams } from '../../../artists/usecases/interfaces/createArtist.params';
import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { CreateCustomerParams } from '../../../customers/usecases/interfaces/createCustomer.params';
import {
  DomainConflict,
  DomainException,
  DomainUnProcessableEntity,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { TypeTransform } from '../../../global/domain/utils/typeTransform';
import { DbServiceException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { ArtistLocation } from '../../../locations/infrastructure/entities/artistLocation.entity';
import { UserType } from '../../domain/enums/userType.enum';
import {
  CreateArtistUserResDto,
  CreateCustomerUserResDto,
} from '../../infrastructure/dtos/createUserRes.dto';
import { RolesProvider } from '../../infrastructure/providers/roles.service';
import { UsersProvider } from '../../infrastructure/providers/users.provider';

import { CreateUserByTypeParams } from './interfaces/createUserByType.params';

@Injectable()
export class CreateUserByTypeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly rolesService: RolesProvider,
    private readonly agendaProvider: AgendaProvider,
    private readonly artistLocationProvider: ArtistLocationProvider,
    private readonly configService: ConfigService,
  ) {
    super(CreateUserByTypeUseCase.name);
  }

  public async execute(
    createUserParams: CreateUserByTypeParams,
  ): Promise<CreateCustomerUserResDto | CreateArtistUserResDto> {
    const existsRole = await this.rolesService.exists(
      createUserParams.userType.toLocaleLowerCase(),
    );

    if (!existsRole) {
      throw new DomainConflict('Role not exists');
    }

    const role = await this.rolesService.findOne({
      where: { name: createUserParams.userType.toLocaleLowerCase() },
    });

    const created = await this.usersProvider.create(createUserParams, role);

    try {
      const response = await this.handleCreateByUserType(
        created.id,
        createUserParams,
      );

      if (response instanceof Artist) {
        const resp = await TypeTransform.to(CreateArtistUserResDto, response);
        this.logger.log(`🟢 Artist created: ${stringify(resp)}`);
        return resp;
      }

      const resp = await TypeTransform.to(CreateCustomerUserResDto, response);
      this.logger.log(`🟢 Customer created: ${stringify(resp)}`);
      return resp;
    } catch (error) {
      await this.handleCreateError(created.id, error);
      throw error;
    }
  }

  private async handleCreateByUserType(
    userId: number,
    dto: CreateUserByTypeParams,
  ): Promise<Customer | Artist> {
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

  private async createArtist(createArtistParams: CreateArtistParams) {
    const artist = await this.artistProvider.create(createArtistParams);

    this.logger.log(`🟢 Artist created: ${artist.id}`);

    let agenda: Agenda;
    try {
      agenda = await this.agendaProvider.createWithArtistInfo(
        createArtistParams,
        artist.id,
      );
    } catch (error) {
      await this.artistProvider.delete(artist.id);
      throw new DomainUnProcessableEntity(error.publicMessage);
    }

    this.logger.log(`🟢 Agenda created: ${agenda.id}`);

    let artistLocation: ArtistLocation;
    try {
      artistLocation = await this.artistLocationProvider.save(
        this.mapCreateArtistInfoToArtistLocation(artist, createArtistParams),
      );
    } catch (error) {
      if (error instanceof DbServiceException) {
        await Promise.all([
          await this.artistProvider.delete(artist.id),
          await this.agendaProvider.delete(agenda.id),
        ]);
        throw new DomainUnProcessableEntity(error.publicError);
      }
      throw error;
    }

    this.logger.log(`🟢 ArtistLocation created: ${stringify(artistLocation)}`);
    this.logger.log(`🟢 Artist created: ${stringify(artist)}`);

    return artist;
  }

  private async createCustomer(
    createCustomerDto: CreateCustomerParams,
  ): Promise<Customer> {
    return this.customerProvider.create(createCustomerDto);
  }

  private async rollbackCreate(userId: number): Promise<void> {
    await this.usersProvider.delete(userId);
  }

  private async handleCreateError(
    userId: number,
    error: DomainException,
  ): Promise<DomainException> {
    await this.rollbackCreate(userId);

    return error;
  }

  private mapCreateArtistInfoToArtistLocation(
    artist: Artist,
    createArtistDto: CreateArtistDto,
  ): Partial<ArtistLocation> {
    return {
      artistId: artist.id,
      name: [artist.firstName, artist.lastName].join(' '),
      profileThumbnail: artist.profileThumbnail,
      address1: createArtistDto.address.address1,
      shortAddress1: createArtistDto.address.shortAddress1,
      address2: createArtistDto.address.address2,
      address3: createArtistDto.address.address3,
      addressType: createArtistDto.address.addressType,
      city: createArtistDto.address.city,
      country: createArtistDto.address.country,
      state: createArtistDto.address.state,
      formattedAddress: createArtistDto.address.formattedAddress,
      googlePlaceId: createArtistDto.address.googlePlaceId,
      lat: createArtistDto.address.geometry.location.lat,
      lng: createArtistDto.address.geometry.location.lng,
      viewport: createArtistDto.address.geometry.viewport,
      location: {
        type: 'Point',
        // TODO: DAR VUELTA
        coordinates: [
          createArtistDto.address.geometry.location.lng,
          createArtistDto.address.geometry.location.lat,
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
      phoneNumberDetails: dto.phoneNumberDetails,
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
      phoneNumber: dto.phoneNumberDetails.number,
    };
  }
}
