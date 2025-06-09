# Event Action Engine Service

Este servicio determina qué acciones están disponibles para los usuarios según el estado del evento y el tipo de usuario.

## Flujo Simplificado MVP

### Estados del Evento
```
CREATED → PENDING_CONFIRMATION → CONFIRMED → IN_PROGRESS → COMPLETED 
    ↓            ↓                   ↓            ↓           ↓
CANCELED     REJECTED           RESCHEDULED  WAITING_FOR_  WAITING_FOR_
                                             PHOTOS        REVIEW
                                                ↓             ↓
                                           COMPLETED      REVIEWED
```

## Acciones por Tipo de Usuario

### 🎨 **CUSTOMER (Cliente)**

| Acción | Estados Permitidos | Restricciones | Descripción |
|--------|-------------------|---------------|-------------|
| `canConfirmEvent` | CREATED, PENDING_CONFIRMATION | Solo customer | Confirmar cita pendiente |
| `canRejectEvent` | CREATED, PENDING_CONFIRMATION | Solo customer | Rechazar cita pendiente |
| `canCancel` | CONFIRMED, RESCHEDULED | ≥24h antes | Cancelar cita confirmada |
| `canReschedule` | CONFIRMED, RESCHEDULED | ≥48h antes | Reprogramar cita |
| `canLeaveReview` | WAITING_FOR_REVIEW, COMPLETED | Sin reviewId | Dejar reseña |
| `canAcceptConsent` | CREATED, PENDING_CONFIRMATION | Solo customer | Aceptar términos |
| `canSendMessage` | Estados activos* | - | Comunicarse |

### 🎯 **ARTIST (Artista)**

| Acción | Estados Permitidos | Restricciones | Descripción |
|--------|-------------------|---------------|-------------|
| `canCancel` | CONFIRMED, RESCHEDULED, PENDING_CONFIRMATION | Sin restricciones | Cancelar cualquier evento |
| `canEdit` | CONFIRMED, RESCHEDULED | Solo artist | Editar detalles del evento |
| `canReschedule` | CONFIRMED, RESCHEDULED | Sin restricciones | Reprogramar cita |
| `canAddWorkEvidence` | WAITING_FOR_PHOTOS, COMPLETED | Solo artist | Subir fotos del trabajo |
| `canSendMessage` | Estados activos* | - | Comunicarse |

*Estados activos: CONFIRMED, IN_PROGRESS, WAITING_FOR_PHOTOS, PENDING_CONFIRMATION, RESCHEDULED, AFTERCARE_PERIOD

## Diferencias Clave

### Cancel vs Reject
- **REJECT**: Solo para customers en eventos pendientes (antes de confirmar)
- **CANCEL**: Para eventos ya confirmados (después de confirmar)

### Restricciones de Tiempo
- **Customer**: 
  - Cancel: 24h de aviso
  - Reschedule: 48h de aviso
- **Artist**: Sin restricciones de tiempo

## Simplificaciones MVP

### Eliminadas para Artists:
- ❌ `canConfirmEvent` - Los eventos ya están en su agenda
- ❌ `canRejectEvent` - Pueden cancelar directamente

### Razón:
Si el evento está en la agenda del artista, significa que ya fue agendado. El artista solo necesita la opción de cancelar si es necesario, no confirmar/rechazar.

## Uso del Servicio

```typescript
const actionEngine = new EventActionEngineService();

const context: EventActionContext = {
  userId: 'user-123',
  userType: UserType.CUSTOMER,
  event: agendaEvent,
  // ... otros campos opcionales
};

const actions = await actionEngine.getAvailableActions(context);

// Verificar acciones disponibles
if (actions.canConfirmEvent) {
  // Mostrar botón de confirmar
}

if (actions.canCancel) {
  // Mostrar botón de cancelar
} else {
  // Mostrar razón: actions.reasons.canCancel
}
```

## Estados de Transición

### Para Customer:
1. **PENDING_CONFIRMATION** → Confirm/Reject/AcceptConsent
2. **CONFIRMED** → Cancel(24h)/Reschedule(48h)/Message
3. **WAITING_FOR_REVIEW** → LeaveReview

### Para Artist:
1. **PENDING_CONFIRMATION** → Cancel
2. **CONFIRMED** → Edit/Cancel/Reschedule/Message
3. **WAITING_FOR_PHOTOS** → AddWorkEvidence

## Notas de Implementación

- El servicio es **stateless** - no modifica el estado del evento
- Las validaciones de tiempo se basan en `startDate` del evento
- Los `reasons` proporcionan mensajes específicos para acciones deshabilitadas
- `canAppeal` siempre es `false` en MVP (se maneja por separado) 