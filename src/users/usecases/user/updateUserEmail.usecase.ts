import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../global/domain/exceptions/domain.exception';
import { DomainBadRule } from '../../../global/domain/exceptions/domainBadRule.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponseHelper } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { UsersService } from '../../domain/services/users.service';

@Injectable()
export class UpdateUserEmailUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly usersService: UsersService) {
    super(UpdateUserEmailUseCase.name);
  }

  public async execute(
    userId: number,
    newEmail: string,
  ): Promise<DomainException | DefaultResponseDto> {
    const emailExists = await this.usersService.findOne({
      where: { email: newEmail },
    });

    if (emailExists) {
      return new DomainBadRule('Email already used');
    }

    const user = await this.usersService.findById(userId);

    if (user.email === newEmail) {
      return new DomainBadRule('The emails must be different');
    }

    user.email = newEmail;

    await this.usersService.save(user);

    // TODO: send email to verify his new email

    return DefaultResponseHelper.ok;
  }
}
