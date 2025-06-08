export enum AppointmentUrgencyLevel {
  CRITICAL = 'CRITICAL', // Action required NOW
  URGENT = 'URGENT', // Approaching (e.g., within 24-48 hours)
  UPCOMING = 'UPCOMING', // On the horizon (e.g., this week)
  INFO = 'INFO', // Everything is okay, just informational
  PAST = 'PAST', // Historical record
} 