import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import stringify from 'fast-safe-stringify';
import { AgendaService } from '../../../agenda/domain/agenda.service';
import { Agenda } from '../../../agenda/infrastructure/entities/agenda.entity';
import { ArtistsDbService } from '../../../artists/infrastructure/database/services/artistsDb.service';
import { CreateArtistDto } from '../../../artists/infrastructure/dtos/createArtist.dto';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { CreateArtistParams } from '../../../artists/usecases/interfaces/createArtist.params';
import { CustomersService } from '../../../customers/domain/customers.service';
import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
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
import { Transform } from '../../../global/domain/utils/transformTo';
import { DbServiceException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { ArtistLocationsDbService } from '../../../locations/infrastructure/database/services/artistLocationsDb.service';
import { ArtistLocation } from '../../../locations/infrastructure/entities/artistLocation.entity';
import { UserType } from '../../domain/enums/userType.enum';
import { RolesService } from '../../domain/services/roles.service';
import { UsersService } from '../../domain/services/users.service';
import { CreateArtistUserResDto } from '../../infrastructure/dtos/createUserRes.dto';
import { CreateUserByTypeParams } from './interfaces/createUserByType.params';

@Injectable()
export class CreateUserByTypeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistsDbService: ArtistsDbService,
    private readonly customerService: CustomersService,
    private readonly rolesService: RolesService,
    private readonly agendaService: AgendaService,
    private readonly artistLocationsDbService: ArtistLocationsDbService,
    private readonly configService: ConfigService,
  ) {
    super(CreateUserByTypeUseCase.name);
  }

  public async execute(
    createUserParams: CreateUserByTypeParams,
  ): Promise<Customer | CreateArtistUserResDto> {
    const role = await this.rolesService.findOne({
      where: { name: createUserParams.userType.toLocaleLowerCase() },
    });

    if (!role) {
      throw new DomainConflict('Role not exists');
    }

    const created = await this.usersService.create(createUserParams, role);

    try {
      const response = await this.handleCreateByUserType(
        created.id,
        createUserParams,
      );

      if (response instanceof Artist) {
        const resp = await Transform.to(CreateArtistUserResDto, response);

        this.logger.log(`🟢 Artist dtoResponse: ${stringify(resp)}`);
        return resp;
      }
      // TODO: Handle customer creation
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
    const artist = await this.artistsDbService.create(createArtistParams);

    this.logger.log(`🟢 Artist created: ${artist.id}`);

    let agenda: Agenda;
    try {
      agenda = await this.agendaService.createWithArtistInfo(
        createArtistParams,
      );
    } catch (error) {
      await this.artistsDbService.delete(artist.id);
      throw new DomainUnProcessableEntity(error.publicMessage);
    }

    this.logger.log(`🟢 Agenda created: ${agenda.id}`);

    let artistLocation: ArtistLocation;
    try {
      artistLocation = await this.artistLocationsDbService.save(
        this.mapCreateArtistInfoToArtistLocation(artist, createArtistParams),
      );
    } catch (error) {
      if (error instanceof DbServiceException) {
        await Promise.all([
          await this.artistsDbService.delete(artist.id),
          await this.agendaService.delete(agenda.id),
        ]);
        throw new DomainUnProcessableEntity(error.publicError);
      }
      throw error;
    }

    this.logger.log(`🟢 ArtistLocation created: ${artistLocation.id}`);

    this.logger.log(`🟢 Artist created: ${stringify(artist)}`);
    return artist;
  }

  private async createCustomer(createCustomerDto: CreateCustomerParams) {
    return this.customerService.create(createCustomerDto);
  }

  private async rollbackCreate(userId: number) {
    await this.usersService.delete(userId);
  }

  private async handleCreateError(userId: number, error: DomainException) {
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
      address2: createArtistDto.address.address2,
      address3: createArtistDto.address.address3,
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
        coordinates: [
          createArtistDto.address.geometry.location.lat,
          createArtistDto.address.geometry.location.lng,
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
