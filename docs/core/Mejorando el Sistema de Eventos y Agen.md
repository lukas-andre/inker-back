# Mejorando el Sistema de Eventos y Agenda para Inker

El sistema de agenda para tatuadores en Inker necesita una estructura robusta que soporte confirmaciones de eventos y gestione eficientemente el ciclo de vida completo de las citas de tatuajes. Tras analizar el código existente, presentaré una solución que optimiza la arquitectura actual mediante la implementación de una máquina de estados bien estructurada.

## Análisis del Sistema Actual

Actualmente, el sistema tiene varias entidades clave:

- `AgendaEvent`: Representa eventos en la agenda con varios campos y estados.
- `AgendaInvitation`: Maneja invitaciones a eventos con estados básicos (pendiente, aceptada, rechazada).
- `Agenda`: Contenedor principal que asocia eventos con artistas y sus horarios.

El sistema utiliza un enum `AgendaEventStatus` para gestionar estados, pero carece de una máquina de estados formal que controle las transiciones según reglas de negocio específicas.

### Problemas Identificados

- La entidad `AgendaInvitation` duplica la funcionalidad que podría estar integrada en `AgendaEvent`.
- El método `validateTransition` está hardcodeado con reglas fijas que serían difíciles de modificar.
- No existe un flujo completo que gestione todos los estados posibles del enum `AgendaEventStatus`.
- Las confirmaciones de citas no están correctamente integradas en el flujo de trabajo principal.

## Solución Propuesta: Máquina de Estados TypeScript

Una máquina de estados proporciona un modelo claro para gestionar el ciclo de vida de los eventos, definiendo explícitamente los estados, eventos y transiciones permitidas[2][18]. Para Inker, implementaré una solución que utilice TypeScript para garantizar la seguridad de tipos y claridad en la implementación.

### 1. Integración de Confirmaciones en AgendaEvent

**Recomendación**: Eliminar la entidad `AgendaInvitation` e integrar el proceso de confirmación directamente en el flujo de estados de `AgendaEvent`.

```typescript
// Actualizar el enum AgendaEventStatus
export enum AgendaEventStatus {
  CREATED = 'created',                      // Estado inicial al crear el evento
  PENDING_CONFIRMATION = 'pending_confirmation',  // Esperando confirmación del cliente
  CONFIRMED = 'confirmed',                  // Cliente ha confirmado
  SCHEDULED = 'scheduled',                  // Confirmado y programado
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
```

### 2. Implementación de la Máquina de Estados

Crearemos un servicio dedicado que funcionará como una máquina de estados formal, permitiendo transiciones específicas entre estados basadas en eventos definidos[8][17].

```typescript
// eventStateMachine.service.ts
import { Injectable } from '@nestjs/common';
import { AgendaEventStatus } from '../domain/enum/agendaEventStatus.enum';
import { DomainUnProcessableEntity } from '../../global/domain/exceptions/domain.exception';
import { INVALID_EVENT_STATUS_TRANSITION } from '../domain/errors/codes';

export type StateTransitionGuard = (
  event: any,
  context: any,
) => boolean;

export type StateTransitionAction = (
  event: any,
  context: any,
) => Promise<void>;

interface StateTransition {
  target: AgendaEventStatus;
  guards?: StateTransitionGuard[];
  actions?: StateTransitionAction[];
}

type StateConfig = {
  [key in AgendaEventStatus]?: {
    transitions: {
      [event: string]: StateTransition;
    };
    onEntry?: StateTransitionAction[];
    onExit?: StateTransitionAction[];
  };
};

@Injectable()
export class EventStateMachineService {
  private stateConfig: StateConfig;

  constructor() {
    this.initializeStateMachine();
  }

  private initializeStateMachine(): void {
    this.stateConfig = {
      [AgendaEventStatus.CREATED]: {
        transitions: {
          request_confirmation: {
            target: AgendaEventStatus.PENDING_CONFIRMATION,
          },
          cancel: {
            target: AgendaEventStatus.CANCELED,
          },
        },
      },
      [AgendaEventStatus.PENDING_CONFIRMATION]: {
        transitions: {
          confirm: {
            target: AgendaEventStatus.CONFIRMED,
          },
          reject: {
            target: AgendaEventStatus.CANCELED,
          },
        },
      },
      // Configuración completa de todos los estados y transiciones...
    };
  }

  async transition(
    currentState: AgendaEventStatus,
    event: string,
    context: any,
  ): Promise<AgendaEventStatus> {
    const stateConfig = this.stateConfig[currentState];
    
    if (!stateConfig) {
      throw new DomainUnProcessableEntity(
        `Estado inválido: ${currentState}`,
      );
    }
    
    const transition = stateConfig.transitions[event];
    
    if (!transition) {
      throw new DomainUnProcessableEntity(
        `${INVALID_EVENT_STATUS_TRANSITION}: Evento ${event} no permitido en estado ${currentState}`,
      );
    }
    
    // Verificar guardas
    if (transition.guards) {
      for (const guard of transition.guards) {
        if (!guard(event, context)) {
          throw new DomainUnProcessableEntity(
            `Transición de ${currentState} a ${transition.target} vía evento ${event} no permitida por guarda`,
          );
        }
      }
    }
    
    // Ejecutar acciones y actualizar estado
    // ...
    
    return transition.target;
  }
}
```

### 3. Diagrama de Estado para Citas de Tatuaje

El siguiente diagrama muestra las transiciones válidas entre los diferentes estados de una cita[4]:

```
                         +----------------------+
                         |                      |
                         v                      |
CREATED ------> PENDING_CONFIRMATION            |
   |                |                           |
   |                v                           |
   |          CONFIRMED -------> RESCHEDULED ---+
   |                |
   |                v
   v          PAYMENT_PENDING
CANCELED           |
                   v
              SCHEDULED
                   |
                   v
              IN_PROGRESS
                   |
                   v
              COMPLETED
                   |
                   v
           WAITING_FOR_PHOTOS
                   |
                   v
           WAITING_FOR_REVIEW
                   |
                   v
              REVIEWED
                   |
                   v
            AFTERCARE_PERIOD
```

## Plan de Implementación por Fases

Para facilitar la implementación sin complicar excesivamente la solución, propongo este plan en cuatro fases:

### Fase 1: Refactorización del Modelo de Estados (2 semanas)

1. Implementar la máquina de estados básica
2. Refactorizar el método `validateTransition` para usar la nueva máquina de estados
3. Actualizar el enum `AgendaEventStatus` con todos los estados necesarios

```typescript
// Ejemplo de código actualizado para ChangeEventStatusUsecase
async execute(agendaId: string, eventId: string, dto: ChangeEventStatusReqDto): Promise<void> {
  // ... Código existente ...
  
  // En lugar de validateTransition directo:
  const newStatus = await this.eventStateMachine.transition(
    event.status,
    dto.eventAction, // Nuevo parámetro que define la acción, no solo el estado destino
    context
  );
  
  // ... Resto del código ...
}
```

### Fase 2: Integración de Confirmaciones (2 semanas)

1. Eliminar la entidad `AgendaInvitation` (opcional)
2. Agregar campos relevantes de invitación a `AgendaEvent` si son necesarios
3. Implementar endpoints para confirmación/rechazo por parte del cliente[5]

```typescript
// AgendaEventController.ts (nuevo endpoint)
@Post(':eventId/confirm')
@UseGuards(JwtAuthGuard)
async confirmEvent(
  @Param('eventId') eventId: string,
  @Body() body: { notes?: string }
) {
  // Lógica para confirmar evento usando la máquina de estados
}
```

### Fase 3: Sistema de Notificaciones y Recordatorios (2 semanas)

1. Implementar servicio de recordatorios automáticos para citas pendientes[5]
2. Mejorar las notificaciones para cada cambio de estado
3. Configurar tiempos recomendados para confirmaciones (48 horas antes)[5]

```typescript
// EventReminderService.ts
@Cron('0 9 * * *') // Ejecutar todos los días a las 9 AM
async sendAppointmentReminders() {
  // Encuentra eventos próximos y envía recordatorios
  const tomorrowEvents = await this.agendaEventProvider.findUpcomingEvents(24);
  
  for (const event of tomorrowEvents) {
    await this.notificationsQueue.add({
      jobId: 'EVENT_REMINDER',
      // ... configuración de notificación ...
    });
  }
}
```

### Fase 4: Sistema de Reviews y Evaluaciones (2 semanas)

1. Crear modelo para reviews vinculado a eventos completados 
2. Implementar endpoints para crear y ver reviews
3. Añadir estadísticas de calificación a perfiles de artistas

```typescript
// Entidad Review
@Entity()
export class EventReview extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ name: 'event_id' })
  eventId: string;
  
  @Column({ type: 'int' })
  rating: number; // 1-5 estrellas
  
  @Column({ type: 'text' })
  comment: string;
  
  // Otros campos relevantes...
}
```

## Lecciones de las Mejores Prácticas

### Máquinas de Estado en TypeScript

Las máquinas de estado son ideales para modelar flujos complejos como el ciclo de vida de las citas[18]. Al implementar una máquina de estado en TypeScript, obtenemos:

- Un modelo predecible y fácil de razonar
- Mayor seguridad con verificación de tipos
- Clara separación entre estados, eventos y acciones
- Capacidad de visualizar el flujo completo[2]

### Confirmaciones de Citas

Las mejores prácticas para confirmaciones incluyen[5]:

1. Enviar solicitudes iniciales de confirmación aproximadamente 48 horas antes de la cita
2. Ofrecer múltiples canales para confirmar (correo electrónico, SMS, dentro de la app)
3. Automatizar recordatorios para citas no confirmadas
4. Incluir toda la información relevante en las solicitudes de confirmación

## Conclusión

La implementación de una máquina de estados formalizada proporcionará a Inker un sistema de eventos y agenda más robusto y escalable. Al separar claramente los estados, eventos y transiciones, el sistema será más mantenible y los flujos de trabajo más predecibles para artistas y clientes.

El enfoque por fases permitirá implementar mejoras graduales sin interrumpir el funcionamiento actual, mientras cada fase aporta valor incremental al producto. La integración de confirmaciones directamente en el flujo principal simplifica la arquitectura y ofrece una mejor experiencia de usuario para los tatuadores y sus clientes.

La máquina de estados propuesta no solo resuelve los problemas actuales sino que proporciona un marco para futuras expansiones como el manejo de disputas, períodos de cuidados posteriores y cualquier otro estado del ciclo de vida de las citas de tatuaje que pueda surgir en el futuro.
