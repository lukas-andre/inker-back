import { DomainBadRule } from "../../../../global/domain/exceptions/domain.exception";
import { BaseUseCase } from "../../../../global/domain/usecases/base.usecase";
import { USER_ALREADY_VERIFIED } from "../../../domain/errors/codes";
import { NotificationType, VerificationType } from "../../../infrastructure/entities/verificationHash.entity";
import { userQueries, UsersProvider } from "../../../infrastructure/providers/users.provider";
import { VerificationHashProvider } from "../../../infrastructure/providers/verificationHash.service";

const MAX_VERIFICATION_ATTEMPTS_REACHED = 'MAX_VERIFICATION_ATTEMPTS_REACHED';
const USER_NOT_FOUND = 'USER_NOT_FOUND';
export abstract class BaseSendVerificationUseCase extends BaseUseCase {
  protected readonly verificationType = VerificationType.ACTIVATE_ACCOUNT;
  protected abstract notificationType: NotificationType;
  protected maxTries: number;

  constructor(
    protected readonly verificationHashProvider: VerificationHashProvider,
    protected readonly usersProvider: UsersProvider,
    serviceName: string,
  ) {
    super(serviceName);
  }

  protected async findUser(identifier: string, field: string) {
    const [result] = await this.usersProvider.source.query(
      userQueries.findUserWithPermissionsByIdentifier(field),
      [identifier]
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

  protected async handleVerificationHash(userId: number, verificationCode: string): Promise<void> {
    const existingHash = await this.verificationHashProvider.findOne({
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
      await this.verificationHashProvider.edit(existingHash.id, {
        ...existingHash,
        tries: existingHash.tries + 1,
        hash: await this.verificationHashProvider.hashVerificationCode(verificationCode),
      });
    } else {
      await this.verificationHashProvider.create(
        userId,
        verificationCode,
        this.notificationType,
        this.verificationType,
        1,
      );
    }
  }
}