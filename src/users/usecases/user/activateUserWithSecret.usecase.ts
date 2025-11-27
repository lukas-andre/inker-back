import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';

@Injectable()
export class ActivateUserWithSecretUseCase extends BaseComponent {
  protected logger = new Logger(ActivateUserWithSecretUseCase.name);

  constructor(private readonly usersRepository: UsersRepository) {
    super(ActivateUserWithSecretUseCase.name);
  }

  async execute(
    userId: string,
    secretKey: string,
  ): Promise<{ activated: boolean }> {
    this.logger.log(`Activating user ${userId} with secret key`);

    const userExists = await this.usersRepository.exists(userId);
    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    const isActive = await this.usersRepository.existsAndIsActive(userId);
    if (isActive) {
      return { activated: true };
    }

    const validSecretKey =
      process.env.USER_ACTIVATION_SECRET ||
      'c31bd447-6054-4111-a881-7301e0b31ef3';

    if (secretKey !== validSecretKey) {
      throw new BadRequestException('Invalid secret key');
    }

    await this.usersRepository.activate(userId);

    return { activated: true };
  }
}
