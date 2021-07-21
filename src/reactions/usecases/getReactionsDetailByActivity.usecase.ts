import { Injectable } from '@nestjs/common';
import { BaseUseCase } from 'src/global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { ReactionsService } from '../domain/services/reactions.service';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import * as stringify from 'json-stringify-safe';

@Injectable()
export class GetReactionsDetailByActivityUseCase extends BaseUseCase {
  constructor(private readonly reactionsService: ReactionsService) {
    super(GetReactionsDetailByActivityUseCase.name);
  }

  async execute(
    jwtPayload: JwtPayload,
    activityId: number,
    activity: string,
  ): Promise<any | DomainException> {
    const result = await this.reactionsService.findByActivityIdAndActivityType(
      activityId,
      activity,
    );

    if (isServiceError(result)) {
      return new DomainConflictException(this.handleServiceError(result));
    }

    this.logger.log(`result:  ${stringify(result)}`);
    return result;
  }
}
