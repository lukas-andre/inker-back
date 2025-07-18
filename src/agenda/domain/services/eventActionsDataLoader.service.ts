import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { EventActionsResultDto } from '../dtos/eventActionsResult.dto';
import { EventActionContext, EventActionEngineService } from './eventActionEngine.service';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';

interface BatchActionRequest {
  eventId: string;
  userId: string;
  userType: UserType;
  event: AgendaEvent;
}

@Injectable()
export class EventActionsDataLoaderService {
  private loaders: Map<string, DataLoader<string, EventActionsResultDto>>;

  constructor(
    private readonly eventActionEngineService: EventActionEngineService,
  ) {
    this.loaders = new Map();
  }

  private createLoader(userId: string, userType: UserType): DataLoader<string, EventActionsResultDto> {
    return new DataLoader<string, EventActionsResultDto>(
      async (eventIds: readonly string[]) => {
        const results = await Promise.all(
          eventIds.map(async (eventId) => {
            const event = this.getEventFromCache(eventId);
            if (!event) {
              return {
                canEdit: false,
                canCancel: false,
                canReschedule: false,
                canSendMessage: false,
                canAddWorkEvidence: false,
                canLeaveReview: false,
                canConfirmEvent: false,
                canRejectEvent: false,
                canAcceptConsent: false,
                canStartSession: false,
                canFinishSession: false,
                canAppeal: false,
                reasons: { error: 'Event not found' },
              };
            }

            const context: EventActionContext = {
              userId,
              userType,
              event,
            };

            return this.eventActionEngineService.getAvailableActions(context);
          }),
        );

        return results;
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
      },
    );
  }

  private eventCache: Map<string, AgendaEvent> = new Map();

  cacheEvent(event: AgendaEvent): void {
    this.eventCache.set(event.id, event);
  }

  private getEventFromCache(eventId: string): AgendaEvent | undefined {
    return this.eventCache.get(eventId);
  }

  async load(
    eventId: string,
    userId: string,
    userType: UserType,
    event: AgendaEvent,
  ): Promise<EventActionsResultDto> {
    const loaderKey = `${userId}-${userType}`;
    
    if (!this.loaders.has(loaderKey)) {
      this.loaders.set(loaderKey, this.createLoader(userId, userType));
    }

    this.cacheEvent(event);
    
    const loader = this.loaders.get(loaderKey)!;
    return loader.load(eventId);
  }

  clearLoaders(): void {
    this.loaders.forEach(loader => loader.clearAll());
    this.loaders.clear();
    this.eventCache.clear();
  }

  clearLoaderForUser(userId: string, userType: UserType): void {
    const loaderKey = `${userId}-${userType}`;
    const loader = this.loaders.get(loaderKey);
    if (loader) {
      loader.clearAll();
      this.loaders.delete(loaderKey);
    }
  }
}