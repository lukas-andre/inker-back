import {
  Injectable,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../users/entities/user.entity';
import { AuthService } from '../services/auth.service';
import { LoginType } from '../enums/loginType.enum';
import { LoginDto } from '../dtos/login.dto';
import { UserType } from '../../users/enums/userType.enum';
import { ArtistsService } from '../../artists/services/artists.service';
import { CustomersService } from '../../customers/services/customers.service';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Customer } from 'src/customers/entities/customer.entity';
import { Artist } from 'src/artists/entities/artist.entity';

@Injectable()
export class AuthHandler {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private artistsService: ArtistsService,
    private customersService: CustomersService,
  ) {}

  async login(loginDto: LoginDto): Promise<JwtPayload> {
    let response: JwtPayload | HttpException;

    const user = await this.usersService.findByType(
      loginDto.loginType,
      loginDto.identifier,
    );

    if (!user || !user.active) {
      throw new ConflictException('Invalid credentials');
    }

    let isValid = false;
    switch (loginDto.loginType) {
      case LoginType.FACEBOOK:
        isValid = true;
        break;
      case LoginType.GOOGLE:
        isValid = false;
        break;
      default:
        response = await this.defaultLogin(user, loginDto);
        break;
    }

    if (response instanceof HttpException) throw response;

    return response;
  }

  async defaultLogin(
    user: User,
    loginDto: LoginDto,
  ): Promise<JwtPayload | HttpException> {
    const result = await this.usersService.validatePassword(
      loginDto.password,
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

  async findUserEntityByType(
    userType: string,
    userId: string,
  ): Promise<Customer | Artist> {
    if (userType === UserType.CUSTOMER)
      return await this.customersService.findOne({ where: { userId } });
    if (userType === UserType.ARTIST)
      return await this.artistsService.findOne({ where: { userId } });
  }
}
