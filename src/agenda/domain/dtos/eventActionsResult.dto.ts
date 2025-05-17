export class EventActionsResultDto {
  canEdit: boolean;
  canCancel: boolean;
  canSendMessage: boolean;
  canAppeal: boolean;
  canReschedule: boolean;
  canAddWorkEvidence: boolean;
  canLeaveReview: boolean;
  reasons?: Record<string, string>;
} 