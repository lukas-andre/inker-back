import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { FindReactionAndReactionTypeGroup } from '../domain/interfaces/findReactionAndReactionTypeGroup.interface';
import { ActivitiesService } from '../domain/services/activities.service';
import { ReactionsService } from '../domain/services/reactions.service';
import { Activity } from '../infrastructure/entities/activity.entity';
import { Reaction } from '../infrastructure/entities/reaction.entity';
import { ReactionToActivityDto } from '../infrastructure/reactionToActivity.dto';

@Injectable()
export class ReactToActivityUseCase extends BaseUseCase {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly reactionsService: ReactionsService,
  ) {
    super(ReactToActivityUseCase.name);
  }

  async execute(
    jwtPayload: JwtPayload,
    reactionDto: ReactionToActivityDto,
  ): Promise<FindReactionAndReactionTypeGroup> {
    const isSameReaction = await this.validateSameUserReaction(
      jwtPayload,
      reactionDto,
    );

    if (isSameReaction) {
      await this.deactivateReaction(reactionDto, jwtPayload);

      //TODO: maybe here return the same dto
      return this.activitiesService.findAllWithTotalReactionsAndReactionGroup(
        reactionDto.activityId,
        reactionDto.activity,
      );
    }

    const existsUserReactionInThisActivity =
      await this.reactionsService.findOne({
        where: {
          activityId: reactionDto.activityId,
          activityType: reactionDto.activity,
          userId: jwtPayload.id,
          active: true,
        },
      });

    if (existsUserReactionInThisActivity) {
      existsUserReactionInThisActivity.active = false;
      await this.reactionsService.save(existsUserReactionInThisActivity);
    }

    await this.reactionsService.save(
      this.mapToReaction(reactionDto, jwtPayload),
    );

    const existingActivity = await this.activitiesService.findOne({
      where: {
        activityId: reactionDto.activityId,
        activityType: reactionDto.activity,
        reactionType: reactionDto.reaction,
      },
    });

    if (existingActivity && !existsUserReactionInThisActivity) {
      existingActivity.reactions++;
      await this.activitiesService.save(existingActivity);
    }

    if (existingActivity && existsUserReactionInThisActivity) {
      const oldUserReaction = await this.activitiesService.findOne({
        where: {
          activityId: existsUserReactionInThisActivity.activityId,
          activityType: existsUserReactionInThisActivity.activityType,
          reactionType: existsUserReactionInThisActivity.reactionType,
        },
      });

      if (oldUserReaction.reactions > 0) {
        oldUserReaction.reactions--;
      }

      await this.activitiesService.save(oldUserReaction);

      const toUpdateActivities = await this.activitiesService.findOne({
        where: {
          activityId: reactionDto.activityId,
          reactionType: reactionDto.reaction,
          activityType: reactionDto.activity,
        },
      });
      toUpdateActivities.reactions++;

      await this.activitiesService.save(toUpdateActivities);
    }

    if (!existingActivity && existsUserReactionInThisActivity) {
      const oldActivityRegister = await this.activitiesService.findOne({
        where: {
          activityId: existsUserReactionInThisActivity.activityId,
          activityType: existsUserReactionInThisActivity.activityType,
          reactionType: existsUserReactionInThisActivity.reactionType,
        },
      });

      oldActivityRegister.reactions--;
      await this.activitiesService.save(oldActivityRegister);
      await this.activitiesService.save(this.mapNewActivity(reactionDto));
    }

    if (!existingActivity && !existsUserReactionInThisActivity) {
      await this.activitiesService.save(this.mapNewActivity(reactionDto));
    }

    return this.activitiesService.findAllWithTotalReactionsAndReactionGroup(
      reactionDto.activityId,
      reactionDto.activity,
    );
  }

  private async deactivateReaction(
    reactionDto: ReactionToActivityDto,
    jwtPayload: JwtPayload,
  ) {
    await this.reactionsService.save(
      this.mapToReaction(reactionDto, jwtPayload, false),
    );
  }

  private mapNewActivity(reactionDto: ReactionToActivityDto) {
    const newActivity = new Activity();
    newActivity.activityId = reactionDto.activityId;
    newActivity.activityType = reactionDto.activity;
    newActivity.reactionType = reactionDto.reaction;
    newActivity.reactions = 1;
    return newActivity;
  }

  private mapToReaction(
    reactionDto: ReactionToActivityDto,
    jwtPayload: JwtPayload,
    isActive = true,
  ): Reaction {
    const newReaction = new Reaction();
    newReaction.active = isActive;
    newReaction.activityId = reactionDto.activityId;
    newReaction.activityType = reactionDto.activity;
    newReaction.location = reactionDto.location;
    newReaction.reactionType = reactionDto.reaction;
    newReaction.userId = jwtPayload.id;
    newReaction.userType = jwtPayload.userType;
    newReaction.userTypeId = jwtPayload.userTypeId;
    newReaction.profileThumbnail = jwtPayload.profileThumbnail;
    newReaction.username = jwtPayload.username;
    return newReaction;
  }

  private async validateSameUserReaction(
    jwtPayload: JwtPayload,
    reactionDto: ReactionToActivityDto,
  ): Promise<boolean> {
    const sameUserReaction = await this.reactionsService.findOne({
      where: {
        userId: jwtPayload.id,
        activityType: reactionDto.activity,
        reactionType: reactionDto.reaction,
        active: true,
      },
    });

    if (sameUserReaction) {
      sameUserReaction.active = false;
      await this.reactionsService.save(sameUserReaction);

      const activity = await this.activitiesService.findOne({
        where: {
          activityId: reactionDto.activityId,
          reactionType: reactionDto.reaction,
          activityType: reactionDto.activity,
        },
      });

      activity.reactions--;
      await this.activitiesService.save(activity);
      return true;
    }

    return false;
  }
}
