import {
  Injectable,
  ConflictException,
  HttpException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { UsersService } from '../../users/use_cases/services/users.service';
import { User } from '../../users/infrastructure/entities/user.entity';
import { LoginType } from '../domain/enums/loginType.enum';
import { UserType } from '../../users/domain/enums/userType.enum';
import { ArtistsService } from '../../artists/use_cases/services/artists.service';
import { CustomersService } from '../../customers/use_cases/services/customers.service';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { AuthService, AUTH_SERVICE_DI_TOKEN } from './services/auth.service';
import { AuthHandler } from './auth.handler';
import { LoginResDto } from '../infrasctructure/dtos/loginRes.dto';
import { LoginReqDto } from '../infrasctructure/dtos/loginReq.dto';

@Injectable()
export class AuthImplHandler implements AuthHandler {
  constructor(
    @Inject(AUTH_SERVICE_DI_TOKEN) private authService: AuthService,
    private usersService: UsersService,
    private artistsService: ArtistsService,
    private customersService: CustomersService,
  ) {}

  async login(loginReqDto: LoginReqDto): Promise<LoginResDto> {
    let response: LoginResDto | HttpException;

    const user = await this.usersService.findByType(
      loginReqDto.loginType,
      loginReqDto.identifier,
    );

    if (!user || !user.active) {
      throw new ConflictException('Invalid credentials');
    }

    let isValid = false;
    switch (loginReqDto.loginType) {
      case LoginType.FACEBOOK:
        isValid = true;
        break;
      case LoginType.GOOGLE:
        isValid = false;
        break;
      default:
        response = await this.defaultLogin(user, loginReqDto);
        break;
    }

    if (response instanceof HttpException) throw response;

    return response;
  }

  private async defaultLogin(
    user: User,
    loginReqDto: LoginReqDto,
  ): Promise<LoginResDto | HttpException> {
    const result = await this.usersService.validatePassword(
      loginReqDto.password,
      user.password,
    );

    if (!result) {
      return new ConflictException('User is not valid');
    }

    const entity = await this.findUserEntityByType(user.userType, user.id);

    if (!entity) {
      return new NotFoundException(`${user.userType}`);
    }

    return this.authService.generateJwtByUserType(user.userType, user, entity);
  }

  private async findUserEntityByType(
    userType: string,
    userId: string,
  ): Promise<Customer | Artist> {
    if (userType === UserType.CUSTOMER)
      return await this.customersService.findOne({ where: { userId } });
    if (userType === UserType.ARTIST)
      return await this.artistsService.findOne({ where: { userId } });
  }
}
