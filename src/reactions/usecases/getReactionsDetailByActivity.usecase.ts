import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';

import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ReactionsService } from '../domain/services/reactions.service';

@Injectable()
export class GetReactionsDetailByActivityUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(private readonly reactionsService: ReactionsService) {
    super(GetReactionsDetailByActivityUseCase.name);
  }

  async execute(
    jwtPayload: JwtPayload,
    activityId: number,
    activity: string,
  ): Promise<any> {
    const result = await this.reactionsService.findByActivityIdAndActivityType(
      activityId,
      activity,
    );

    this.logger.log(`result:  ${stringify(result)}`);
    return result;
  }
}
