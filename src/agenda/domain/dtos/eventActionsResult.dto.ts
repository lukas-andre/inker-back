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
  canAcceptConsent: boolean;
  canStartSession: boolean;
  canFinishSession: boolean;
  reasons?: Record<string, string>;
} 