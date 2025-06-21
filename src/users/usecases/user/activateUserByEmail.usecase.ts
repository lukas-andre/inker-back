import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';

@Injectable()
export class ActivateUserByEmailUseCase extends BaseComponent {
  protected logger = new Logger(ActivateUserByEmailUseCase.name);

  constructor(private readonly usersRepository: UsersRepository) {
    super(ActivateUserByEmailUseCase.name);
  }

  async execute(email: string): Promise<{ activated: boolean }> {
    this.logger.log(`Activating user with email ${email}`);

    // Find user by email
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }

    // Check if user is already active
    if (user.active) {
      return { activated: true };
    }

    // Activate user
    await this.usersRepository.activate(user.id);

    return { activated: true };
  }
}
