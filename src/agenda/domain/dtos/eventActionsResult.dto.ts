export class EventActionsResultDto {
  canEdit: boolean;
  canCancel: boolean;
  canSendMessage: boolean;
  canAcceptOffer: boolean;
  canRejectOffer: boolean;
  canAppeal: boolean;
  canReschedule: boolean;
  canAddWorkEvidence: boolean;
  canLeaveReview: boolean;
  reasons?: Record<string, string>;
} 