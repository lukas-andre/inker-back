export enum AgendaEventStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  RESCHEDULED = 'rescheduled',
  WAITING_FOR_PHOTOS = 'waiting_for_photos',
  WAITING_FOR_REVIEW = 'waiting_for_review',
  REVIEWED = 'reviewed',
  CANCELED = 'canceled',
  PENDING_CONFIRMATION = 'pending_confirmation',
  PAYMENT_PENDING = 'payment_pending',
  AFTERCARE_PERIOD = 'aftercare_period',
  DISPUTE_OPEN = 'dispute_open'
}