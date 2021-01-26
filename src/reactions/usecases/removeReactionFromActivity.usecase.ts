import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { Activity } from '../infrastructure/entities/activity.entity';
import { JwtPayload } from 'src/global/domain/interfaces/jwtPayload.interface';
import { ActivitiesService } from '../domain/services/activities.service';
import { ReactionsService } from '../domain/services/reactions.service';
import { Reaction } from '../infrastructure/entities/reaction.entity';
import { ReactionToActivityDto } from '../infrastructure/reactionToActivity.dto';

// TODO: HACER ESTA WEA
@Injectable()
export class RemoveReactionFromActivitiUseCase {
  private readonly logger = new Logger(RemoveReactionFromActivitiUseCase.name);

  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly reactionsService: ReactionsService,
  ) {}

  async execute(
    jwtPayload: JwtPayload,
    reactionDto: ReactionToActivityDto,
  ): Promise<Activity | DomainException> {
    const existsUserReaction = await this.reactionsService.findOne({
      where: { userId: jwtPayload.id },
      order: {
        created_at: 'DESC',
      },
    });

    if (existsUserReaction) {
      existsUserReaction.active = false;
      await this.reactionsService.save(existsUserReaction);
    }

    const newReaction = new Reaction();
    newReaction.active = true;
    newReaction.activityId = reactionDto.activityId;
    newReaction.activityType = reactionDto.activity;
    newReaction.location = reactionDto.location;
    newReaction.reactionType = reactionDto.reaction;
    newReaction.userId = jwtPayload.id;
    newReaction.userType = jwtPayload.userType;
    newReaction.userTypeId = jwtPayload.userTypeId;
    newReaction.profileThumbnail = jwtPayload.profileThumbnail;
    newReaction.username = jwtPayload.username;

    console.log('newReaction: ', newReaction);

    await this.reactionsService.save(newReaction);

    const existingActivity = await this.activitiesService.findOne({
      where: {
        activityId: reactionDto.activityId,
        reactionType: reactionDto.reaction,
      },
    });

    console.log('existingActivity: ', existingActivity);

    if (existingActivity && !existsUserReaction) {
      existingActivity.reactions++;
      return await this.activitiesService.save(existingActivity);
    }

    console.log('existsUserReaction: ', existsUserReaction);

    if (existingActivity && existsUserReaction) {
      existingActivity.reactions--;
      await this.activitiesService.save(existingActivity);

      const toUpdateActivities = await this.activitiesService.findOne({
        where: {
          reactionType: reactionDto.reaction,
        },
      });
      toUpdateActivities.reactions++;

      return await this.activitiesService.save(toUpdateActivities);
    }

    // ESTO PUEDE PASAR SI EL USUARIO YA REACCIONO.
    // Y SE QUIERE CAMBIIAR A UN NUEVA REACCION SIN ACTIVIDAD REGISTRADA AUN
    if (!existingActivity && existsUserReaction) {
      const oldActivityRegister = await this.activitiesService.findOne({
        where: {
          activityId: existsUserReaction.activityId,
          reactionType: existsUserReaction.reactionType,
        },
      });

      oldActivityRegister.reactions--;
      await this.activitiesService.save(oldActivityRegister);

      const newActivity = new Activity();
      newActivity.activityId = reactionDto.activityId;
      newActivity.reactionType = reactionDto.reaction;
      newActivity.reactions = 1;
      return await this.activitiesService.save(newActivity);
    }

    if (!existingActivity && !existsUserReaction) {
      const newActivity = new Activity();
      newActivity.activityId = reactionDto.activityId;
      newActivity.reactionType = reactionDto.reaction;
      newActivity.reactions = 1;
      return await this.activitiesService.save(newActivity);
    }

    return this.activitiesService.findOne({
      where: { activityId: reactionDto.activityId },
    });
  }
}
