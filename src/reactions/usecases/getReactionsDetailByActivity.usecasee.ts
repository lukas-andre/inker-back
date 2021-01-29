import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { Activity } from '../infrastructure/entities/activity.entity';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { ActivitiesService } from '../domain/services/activities.service';
import { ReactionsService } from '../domain/services/reactions.service';
import { Reaction } from '../infrastructure/entities/reaction.entity';
import { ReactionToActivityDto } from '../infrastructure/reactionToActivity.dto';
import { FindReactionAndReactionTypeGroup } from '../domain/interfaces/findReactionAndReactionTypeGroup.interface';

@Injectable()
export class GetReactionsDetailByActivityUseCase
 {
  private readonly logger = new Logger(GetReactionsDetailByActivityUseCase.name);

  constructor(
    private readonly reactionsService: ReactionsService,
  ) {}

  async execute(
    jwtPayload: JwtPayload,
    activityId: number,
    activity: string,
  ): Promise<any | DomainException> {
    const result = await this.reactionsService.findByActivityIdAndActivityType(
      activityId,
      activity,
    );
    console.log('result: ', result);
    return result;
  }
}
