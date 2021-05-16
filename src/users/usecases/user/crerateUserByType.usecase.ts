import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateArtistDto } from '../../../artists/infrastructure/dtos/createArtist.dto';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { ArtistsService } from '../../../artists/domain/services/artists.service';
import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
import { CustomersService } from '../../../customers/domain/customers.service';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { serviceErrorStringify } from '../../../global/domain/utils/serviceErrorStringify';
import { UserType } from '../../domain/enums/userType.enum';
import { RolesService } from '../../domain/services/roles.service';
import { UsersService } from '../../domain/services/users.service';
import { CreateUserByTypeParams } from './interfaces/createUserByType.params';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { CreateCustomerParams } from '../../../customers/usecases/interfaces/createCustomer.params';

@Injectable()
export class CreateUserByTypeUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly customerService: CustomersService,
    private readonly rolesService: RolesService,
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

    console.log('response: ', response);

    if (response instanceof ServiceError) {
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
        return await this.createCustomer(createCustomerDto);
      },
      [UserType.ARTIST]: async () => {
        const createArtistDto = Object.assign(new CreateArtistDto(), {
          ...dto,
          contactEmail: dto.email ? dto.email : undefined,
          userId,
        });
        return await this.createArtist(createArtistDto);
      },
    };

    return createByType[dto.userType]();
  }

  private async createArtist(createArtistDto: CreateArtistDto) {
    const result = await this.artistsService.create(createArtistDto);
    return result;
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
    return new DomainConflictException(serviceErrorStringify(error));
  }
}
