import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createUser.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../services/users.service';
import { UserType } from '../enums/userType.enum';
import { CustomersService } from '../../customers/services/customers.service';
import { CreateCustomerDto } from '../../customers/dtos/createCustomer.dto';
import { ServiceError } from '../../global/interfaces/serviceError';
import { serviceErrorStringify } from '../../global/utils/serviceErrorStringify';
import { CreateArtistDto } from '../../artists/dtos/createArtist.dto';
import { ArtistsService } from '../../artists/services/artists.service';
import { RolesService } from '../services/roles.service';

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

  private async handleCreateByUserType(userId: string, dto: CreateUserDto) {
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
