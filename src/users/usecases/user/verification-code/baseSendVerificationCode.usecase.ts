import { DomainBadRule } from '../../../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../../../global/domain/usecases/base.usecase';
import { USER_ALREADY_VERIFIED } from '../../../domain/errors/codes';
import {
  NotificationType,
  VerificationType,
} from '../../../infrastructure/entities/verificationHash.entity';
import {
  UsersRepository,
  userQueries,
} from '../../../infrastructure/repositories/users.repository';
import { VerificationHashRepository } from '../../../infrastructure/repositories/verificationHash.repository';

const MAX_VERIFICATION_ATTEMPTS_REACHED = 'MAX_VERIFICATION_ATTEMPTS_REACHED';
const USER_NOT_FOUND = 'USER_NOT_FOUND';
export abstract class BaseSendVerificationUseCase extends BaseUseCase {
  protected readonly verificationType = VerificationType.ACTIVATE_ACCOUNT;
  protected abstract notificationType: NotificationType;
  protected maxTries: number;

  constructor(
    protected readonly verificationHashRepository: VerificationHashRepository,
    protected readonly usersRepository: UsersRepository,
    serviceName: string,
  ) {
    super(serviceName);
  }

  protected async findUser(identifier: string, field: string) {
    const [result] = await this.usersRepository.source.query(
      userQueries.findUserWithPermissionsByIdentifier(field),
      [identifier],
    );

    if (!result?.user) {
      throw new DomainBadRule(USER_NOT_FOUND);
    }

    return result.user;
  }

  protected validateUserStatus(user: any) {
    if (user.active) {
      throw new DomainBadRule(USER_ALREADY_VERIFIED);
    }
  }

  protected async handleVerificationHash(
    userId: string,
    verificationCode: string,
  ): Promise<void> {
    const existingHash = await this.verificationHashRepository.findOne({
      where: {
        userId,
        notificationType: this.notificationType,
        verificationType: this.verificationType,
      },
    });

    if (existingHash) {
      if (existingHash.tries >= this.maxTries) {
        throw new DomainBadRule(MAX_VERIFICATION_ATTEMPTS_REACHED);
      }
      await this.verificationHashRepository.edit(existingHash.id, {
        ...existingHash,
        tries: existingHash.tries + 1,
        hash: await this.verificationHashRepository.hashVerificationCode(
          verificationCode,
        ),
      });
    } else {
      await this.verificationHashRepository.create(
        userId,
        verificationCode,
        this.notificationType,
        this.verificationType,
        1,
      );
    }
  }
}
