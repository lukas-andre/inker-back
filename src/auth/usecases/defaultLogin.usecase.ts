import { Injectable } from '@nestjs/common';

import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import { CustomerProvider } from '../../customers/infrastructure/providers/customer.provider';
import {
  DomainBadRule,
  DomainConflict,
  DomainNotFound,
  DomainUnauthorized,
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
import { PushNotificationService } from '../../notifications/services/push/pushNotification.service';

@Injectable()
export class DefaultLoginUseCase extends BaseUseCase implements UseCase {
  constructor(
    private authService: AuthService,
    private usersProvider: UsersProvider,
    private artistProvider: ArtistProvider,
    private customerProvider: CustomerProvider,
    private pushNotificationService: PushNotificationService,
  ) {
    super(DefaultLoginUseCase.name);
  }

  async execute(loginParams: LoginParams): Promise<DefaultLoginResult> {
    this.logger.log({ loginParams });
    const result = await this.usersProvider.findByLoginType(
      loginParams.loginType,
      loginParams.identifier,
    );

    this.logger.log({ result });

    const { user } = (result as Array<{ user: User }>)[0];
    if (!user) {
      throw new DomainConflict('Invalid credentials');
    }

    const loginResult = await this.defaultLogin(user, loginParams);

    // TODO: do this async, a message queue or something like that
    if (loginParams.fcmToken && loginParams.deviceType) {
      await this.pushNotificationService.saveToken(user.id, loginParams.fcmToken, loginParams.deviceType);
    }

    return loginResult;
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
      throw new DomainBadRule('Invalid credentials');
    }

    if (!user.active) {
      throw new DomainConflict('User is not active');
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
        userFounded = await this.artistProvider.findOne({
          where: { userId },
        });
        break;
    }
    return userFounded;
  }
}
