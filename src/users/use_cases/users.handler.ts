import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateArtistDto } from '../../artists/infrastructure/dtos/createArtist.dto';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { ArtistsService } from '../../artists/use_cases/services/artists.service';
import { CreateCustomerDto } from '../../customers/infrastructure/dtos/createCustomer.dto';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import { CustomersService } from '../../customers/use_cases/services/customers.service';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { serviceErrorStringify } from '../../global/domain/utils/serviceErrorStringify';
import { CreateUserDto } from '../infrastructure/dtos/createUser.dto';
import { UserType } from '../domain/enums/userType.enum';
import { RolesService } from './services/roles.service';
import { UsersService } from './services/users.service';

@Injectable()
export class UsersHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly customerService: CustomersService,
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService,
  ) {}

  async handleCreate(createUserDto: CreateUserDto) {
    const role = await this.rolesService.findOne({
      where: { name: createUserDto.userType.toLocaleLowerCase() },
    });

    if (!role) {
      throw new ConflictException('Role not exists');
    }

    const created = await this.usersService.create(createUserDto, role);
    if (!created) {
      throw new ConflictException('User already exists');
    }

    const response = await this.handleCreateByUserType(
      created.id,
      createUserDto,
    );

    if (response instanceof ServiceError) {
      this.handleCreateError(created.id, response);
    }

    return created;
  }

  private async handleCreateByUserType(
    userId: string,
    dto: CreateUserDto,
  ): Promise<Customer | Artist | ServiceError> {
    const createByType = {
      [UserType.CUSTOMER]: async () => {
        const createCustomerDto = Object.assign(new CreateCustomerDto(), {
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

    return await createByType[dto.userType]();
  }

  async createArtist(createArtistDto: CreateArtistDto) {
    const result = await this.artistsService.create(createArtistDto);
    return result;
  }

  private async createCustomer(createCustomerDto: CreateCustomerDto) {
    const result = await this.customerService.create(createCustomerDto);
    return result;
  }

  private async rollbackCreate(userId: string) {
    await this.usersService.delete(userId);
  }

  private async handleCreateError(userId: string, error: ServiceError) {
    await this.rollbackCreate(userId);
    throw new ConflictException(serviceErrorStringify(error));
  }
}
