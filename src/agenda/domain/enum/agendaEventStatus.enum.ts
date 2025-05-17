export enum AgendaEventStatus {
  CREATED = 'created',                      // Estado inicial al crear el evento
  PENDING_CONFIRMATION = 'pending_confirmation',  // Esperando confirmación del cliente
  CONFIRMED = 'confirmed',                  // Cliente ha confirmado
  IN_PROGRESS = 'in_progress',              // Sesión en curso
  COMPLETED = 'completed',                  // Sesión terminada
  RESCHEDULED = 'rescheduled',              // Cita reprogramada
  WAITING_FOR_PHOTOS = 'waiting_for_photos', // Esperando fotos del trabajo
  WAITING_FOR_REVIEW = 'waiting_for_review', // Esperando reseña del cliente
  REVIEWED = 'reviewed',                     // Cliente ha dejado reseña
  CANCELED = 'canceled',                     // Cita cancelada
  PAYMENT_PENDING = 'payment_pending',       // Pendiente de pago
  AFTERCARE_PERIOD = 'aftercare_period',     // Período de cuidados posteriores
  DISPUTE_OPEN = 'dispute_open'              // Disputa abierta
}