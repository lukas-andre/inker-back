import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/domain/services/users.service';
import { User } from '../../users/infrastructure/entities/user.entity';
import { UserType } from '../../users/domain/enums/userType.enum';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { CustomersService } from '../../customers/domain/customers.service';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { AuthService } from '../domain/auth.service';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DefaultLoginResult } from './interfaces/defaultLogin.result';
import { LoginParams } from './interfaces/defaultLogin.params';

@Injectable()
export class DefaultLoginUseCase {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private artistsService: ArtistsService,
    private customersService: CustomersService,
  ) {}

  async execute(
    loginParams: LoginParams,
  ): Promise<DefaultLoginResult | DomainException> {
    let response: DefaultLoginResult | DomainException;

    const user = await this.usersService.findByType(
      loginParams.loginType,
      loginParams.identifier,
    );

    if (!user || !user.active) {
      return new DomainConflictException('Invalid credentials');
    }

    response = await this.defaultLogin(user, loginParams);

    if (response instanceof DomainException) return response;

    return response;
  }

  private async defaultLogin(
    user: User,
    loginParams: LoginParams,
  ): Promise<DefaultLoginResult | DomainException> {
    const result = await this.usersService.validatePassword(
      loginParams.password,
      user.password,
    );

    if (!result) {
      return new DomainConflictException('User is not valid');
    }

    const entity = await this.findUserEntityByType(user.userType, user.id);

    if (!entity) {
      return new DomainNotFoundException(`User not found`);
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
