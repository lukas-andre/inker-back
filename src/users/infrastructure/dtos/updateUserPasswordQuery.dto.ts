import { IsEnum } from 'class-validator';

import { NotificationType } from '../entities/verificationHash.entity';

export class UpdateUserPasswordQueryDto {
  @IsEnum(NotificationType)
  readonly notificationType: NotificationType;
}
