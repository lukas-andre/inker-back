export class EventActionsResultDto {
  canEdit: boolean;
  canCancel: boolean;
  canSendMessage: boolean;
  canAppeal: boolean;
  canReschedule: boolean;
  canAddWorkEvidence: boolean;
  canLeaveReview: boolean;
  canConfirmEvent: boolean;
  canRejectEvent: boolean;
  reasons?: Record<string, string>;
} 