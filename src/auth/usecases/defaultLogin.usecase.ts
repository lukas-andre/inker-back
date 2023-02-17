import { Injectable } from '@nestjs/common';

import { ArtistsDbService } from '../../artists/infrastructure/database/services/artistsDb.service';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import { CustomerProvider } from '../../customers/infrastructure/providers/customer.provider';
import {
  DomainBadRule,
  DomainConflict,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { User } from '../../users/infrastructure/entities/user.entity';
import { UsersProvider } from '../../users/infrastructure/providers/users.provider';
import { AuthService } from '../domain/auth.service';

import { LoginParams } from './interfaces/defaultLogin.params';
import { DefaultLoginResult } from './interfaces/defaultLogin.result';
@Injectable()
export class DefaultLoginUseCase extends BaseUseCase implements UseCase {
  constructor(
    private authService: AuthService,
    private usersProvider: UsersProvider,
    private artistsDbService: ArtistsDbService,
    private customerProvider: CustomerProvider,
  ) {
    super(DefaultLoginUseCase.name);
  }

  async execute(loginParams: LoginParams): Promise<DefaultLoginResult> {
    this.logger.log({ loginParams });
    const user = await this.usersProvider.findByType(
      loginParams.loginType,
      loginParams.identifier,
    );

    this.logger.log({ user });

    if (!user) {
      throw new DomainConflict('Invalid credentials');
    }

    return this.defaultLogin(user, loginParams);
  }

  private async defaultLogin(
    user: User,
    loginParams: LoginParams,
  ): Promise<DefaultLoginResult> {
    const result = await this.usersProvider.validatePassword(
      loginParams.password,
      user.password,
    );

    if (!result) {
      throw new DomainConflict('Invalid credentials');
    }

    if (!user.active) {
      throw new DomainBadRule('User is not active');
    }

    const entity = await this.findUserEntityByType(user.userType, user.id);

    if (!entity) {
      throw new DomainNotFound(`User not found`);
    }

    return this.authService.generateJwtByUserType(user.userType, user, entity);
  }

  private async findUserEntityByType(
    userType: string,
    userId: number,
  ): Promise<Customer | Artist> {
    let userFounded = null;
    switch (userType) {
      case UserType.CUSTOMER:
        userFounded = await this.customerProvider.findOne({
          where: { userId },
        });
        break;
      case UserType.ARTIST:
        userFounded = await this.artistsDbService.findOne({
          where: { userId },
        });
        break;
    }
    return userFounded;
  }
}
