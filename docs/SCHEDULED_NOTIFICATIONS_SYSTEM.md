# Sistema de Notificaciones Programadas - Inker

## Descripción General

Este documento describe la implementación completa del sistema de notificaciones programadas para la plataforma de citas de tatuajes Inker. El sistema utiliza **NestJS Schedule** con trabajos cron para gestionar recordatorios automáticos, seguimientos y reportes.

## Arquitectura del Sistema

### Tecnologías Utilizadas
- **NestJS Schedule** (`@nestjs/schedule`) - Jobs cron programados
- **Bull.js** - Sistema de colas para notificaciones
- **PostgreSQL** - Base de datos con consultas SQL nativas
- **Handlebars** - Motor de plantillas para emails
- **Firebase Admin** - Notificaciones push

### Patrón Arquitectónico
- **Clean Architecture** - Separación clara entre dominio, casos de uso e infraestructura
- **Repository Pattern** - Consultas SQL nativas sin JOINs entre bases de datos
- **Event-Driven** - Sistema de eventos para notificaciones asíncronas

## Componentes Implementados

### 1. Capa de Dominio

#### Enums (`src/schedulers/domain/enum/`)
- **`reminderType.enum.ts`** - Tipos de recordatorios y categorías de jobs cron
- **`cronJobCategory.enum.ts`** - Categorías de trabajos programados

#### Servicios de Dominio (`src/schedulers/domain/services/`)
- **`reminderCalculation.service.ts`** - Cálculo de ventanas temporales y timestamps SQL

### 2. Capa de Infraestructura

#### Jobs Programados (`src/schedulers/infrastructure/jobs/`)

1. **`appointmentReminder.job.ts`**
   - **Frecuencia**: Cada 30 minutos
   - **Función**: Envía recordatorios pre-cita (24h, 2h, 30min antes)
   - **Lógica**: Verifica `reminder_sent` para evitar duplicados

2. **`consentReminder.job.ts`**
   - **Frecuencia**: Cada hora
   - **Función**: Recordatorios de consentimiento pendiente
   - **Ventanas**: 12h y 2h antes de la cita

3. **`confirmationChecker.job.ts`**
   - **Frecuencia**: Cada hora
   - **Función**: Auto-cancelación después de 48h sin confirmación
   - **Estados**: `CREATED` y `PENDING_CONFIRMATION`

4. **`reviewReminder.job.ts`**
   - **Frecuencia**: Cada 4 horas
   - **Función**: Solicitudes de reseñas post-cita
   - **Ventanas**: 24h y 48h después de completar

5. **`monthlyReport.job.ts`**
   - **Frecuencia**: Primer día del mes a las 9:00 AM
   - **Función**: Reportes de rendimiento mensual para artistas

#### Servicios de Agregación
- **`monthlyReportAggregator.service.ts`** - Agrega datos de múltiples bases de datos

### 3. Extensiones de Repositorios

#### AgendaEventRepository
```typescript
// Nuevos métodos añadidos:
- findEventsForReminder(timeWindow, reminderType)
- findEventsNeedingConsentReminder(timeWindow)
- findPendingConfirmationEvents()
- findCompletedEventsForReview(timeWindow)
- findEventsNeedingPhotos()
- markRemindersAsSent(eventIds, reminderType)
- getEventsForMonthlyReport(year, month)
```

#### ArtistRepository
```typescript
// Nuevos métodos añadidos:
- getArtistInfoForReport(artistId)
- findActiveArtistsForReports()
- getArtistsByIds(artistIds)
```

#### ReviewRepository & QuotationRepository
```typescript
// Nuevos métodos para reportes mensuales:
- getReviewsSummaryForMonth(year, month)
- getRevenueForMonth(year, month)
```

### 4. Schema de Base de Datos

#### Actualización de `agenda_event`
```sql
-- Campo añadido para tracking de recordatorios
ALTER TABLE agenda_event ADD COLUMN reminder_sent JSONB DEFAULT '{}';

-- Estructura del campo reminder_sent:
{
  "APPOINTMENT_24H": "2024-01-15T10:00:00Z",
  "APPOINTMENT_2H": "2024-01-16T08:00:00Z",
  "CONSENT_12H": "2024-01-15T22:00:00Z"
}
```

### 5. Sistema de Notificaciones

#### Schemas de Validación (`src/queues/notifications/domain/schemas/`)
- **`agenda.ts`** - Jobs de agenda con nuevos tipos de recordatorios
- **`email.ts`** - Tipos de email con validación Zod
- **`job.ts`** - Unión de tipos de trabajos

#### Plantillas de Email (`src/notifications/services/email/templates/`)
1. **`appointmentReminder.hbs`** - Recordatorio de cita próxima
2. **`consentReminder.hbs`** - Recordatorio de consentimiento pendiente
3. **`confirmationReminder.hbs`** - Recordatorio de confirmación pendiente

#### Registro de Plantillas
- **`template.registry.ts`** - Registro centralizado de todas las plantillas

## Flujo de Notificaciones

### 1. Recordatorios de Cita
```
Event: CONFIRMED appointment
├── 24h antes → Email + Push notification
├── 2h antes → Email + Push notification
└── 30min antes → Push notification
```

### 2. Gestión de Confirmaciones
```
Event: CREATED/PENDING_CONFIRMATION
├── Hourly check
├── 48h timeout → Auto-cancel
└── Notification to customer
```

### 3. Seguimiento Post-Cita
```
Event: COMPLETED appointment
├── 24h después → Review request
├── 48h después → Second review request
└── Immediate → Photo request to artist
```

### 4. Recordatorios de Consentimiento
```
Event: Pending consent
├── 12h antes → First reminder
└── 2h antes → Final reminder
```

## Configuración de Cron Jobs

### Frecuencias Implementadas
- **Cada 30 minutos**: `0 */30 * * * *` - Recordatorios de cita
- **Cada hora**: `0 0 * * * *` - Confirmaciones y consentimientos
- **Cada 4 horas**: `0 0 */4 * * *` - Recordatorios de reseñas
- **Mensual**: `0 0 9 1 * *` - Reportes mensuales

### Consideraciones Técnicas

#### Prevención de Duplicados
- Campo `reminder_sent` en JSONB para tracking granular
- Verificación de timestamps antes de envío
- Logs detallados para debugging

#### Manejo de Errores
- Try-catch en todos los jobs
- Logging estructurado con contexto
- Graceful degradation en caso de fallos

#### Performance
- Consultas SQL optimizadas con índices
- Agregación de datos en capa de servicio
- Paginación para datasets grandes

## Monitoreo y Logs

### Estructura de Logs
```typescript
// Ejemplo de log estructurado
this.logger.debug('Processing appointment reminders', {
  timeWindow: '24_HOURS',
  eventsFound: events.length,
  reminderType: ReminderType.APPOINTMENT_24H
});
```

### Métricas Clave
- Número de recordatorios enviados por tipo
- Eventos auto-cancelados por timeout
- Tasa de éxito de envío de notificaciones
- Tiempo de procesamiento de jobs

## Análisis de Estado de Consultas de Jobs

A continuación se presenta un análisis de las consultas SQL ejecutadas por los jobs programados, basado en los logs recientes.

### ✅ Consultas Exitosas

Las siguientes consultas se están ejecutando correctamente y demuestran el patrón correcto para acceder a los datos de la agenda.

**1. Búsqueda de eventos para recordatorios de cita:**
*   **Job**: `appointmentReminder.job.ts`
*   **Propósito**: Encuentra eventos confirmados o reprogramados dentro de una ventana de tiempo específica para enviar recordatorios.
*   **SQL**:
    ```sql
    SELECT
      ae.id,
      ae.agenda_id as "agendaId",
      ae.title,
      ae.info,
      ae.start_date as "startDate",
      ae.end_date as "endDate",
      ae.status,
      ae.customer_id as "customerId",
      ae.quotation_id as "quotationId",
      ae.review_id as "reviewId",
      ae.created_at as "createdAt",
      ae.updated_at as "updatedAt",
      ae.reminder_sent as "reminderSent",
      json_build_object(
        'id', a.id,
        'artistId', a.artist_id
      ) as agenda
    FROM agenda_event ae
    INNER JOIN agenda a ON ae.agenda_id = a.id
    WHERE ae.start_date >= $1
      AND ae.start_date <= $2
      AND ae.status IN ('confirmed', 'rescheduled')
      AND ae.deleted_at IS NULL
    ORDER BY ae.start_date ASC
    ```

**2. Búsqueda de eventos pendientes de confirmación:**
*   **Job**: `confirmationChecker.job.ts`
*   **Propósito**: Encuentra eventos que no han sido confirmados y superaron el tiempo límite para ser auto-cancelados.
*   **SQL**:
    ```sql
    SELECT
      ae.id,
      ae.agenda_id as "agendaId",
      ae.title,
      ae.info,
      ae.start_date as "startDate",
      ae.end_date as "endDate",
      ae.status,
      ae.customer_id as "customerId",
      ae.quotation_id as "quotationId",
      ae.created_at as "createdAt",
      ae.reminder_sent as "reminderSent",
      json_build_object(
        'artistId', a.artist_id
      ) as agenda
    FROM agenda_event ae
    INNER JOIN agenda a ON ae.agenda_id = a.id
    WHERE ae.status IN ('pending_confirmation', 'created')
      AND ae.created_at <= $1
    ORDER BY ae.created_at ASC
    ```

**3. Búsqueda de eventos completados para solicitar reseña:**
*   **Job**: `reviewReminder.job.ts`
*   **Propósito**: Encuentra eventos finalizados que aún no tienen una reseña para enviar un recordatorio.
*   **SQL**:
    ```sql
    SELECT
      ae.id,
      ae.agenda_id as "agendaId",
      ae.title,
      ae.start_date as "startDate",
      ae.end_date as "endDate",
      ae.status,
      ae.customer_id as "customerId",
      ae.review_id as "reviewId",
      json_build_object(
        'artistId', a.artist_id
      ) as agenda
    FROM agenda_event ae
    INNER JOIN agenda a ON ae.agenda_id = a.id
    WHERE ae.end_date >= $1
      AND ae.end_date <= $2
      AND ae.status IN ('completed', 'waiting_for_review')
      AND ae.review_id IS NULL
      AND ae.deleted_at IS NULL
    ```

### ❌ Consultas Fallidas y Errores

Las siguientes consultas están fallando. El problema principal es el intento de realizar `JOIN`s entre tablas de diferentes bases de datos (módulos), lo cual viola las reglas de la arquitectura del proyecto.

**1. Búsqueda de eventos que necesitan recordatorio de consentimiento:**
*   **Jobs**: `consentReminder.job.ts`, `appointmentReminder.job.ts` (al verificar consentimientos)
*   **Error**: `QueryFailedError: relation "signed_consent" does not exist`
*   **Causa**: La consulta intenta unir `agenda_event` (base de datos de agenda) con `signed_consent` (base de datos del módulo de consentimientos). Los `JOIN`s entre bases de datos no están permitidos.
*   **SQL Fallida**:
    ```sql
    SELECT ...
    FROM agenda_event ae
    ...
    LEFT JOIN signed_consent sc ON sc.event_id = ae.id ...
    WHERE ... sc.id IS NULL
    ```
*   **Solución Propuesta**: En lugar de un `JOIN`, el `AgendaEventRepository` debe obtener los eventos y luego, en una capa de servicio (`ConsentReminderService` o similar), se debe consultar el `ConsentModule` para verificar qué eventos no tienen un consentimiento firmado.

**2. Búsqueda de eventos para recordatorio de reseña (con JOIN):**
*   **Job**: `reviewReminder.job.ts`
*   **Error**: `QueryFailedError: relation "review" does not exist`
*   **Causa**: La consulta intenta unir `agenda_event` (base de datos de agenda) con `review` (base de datos del módulo de reseñas).
*   **SQL Fallida**:
    ```sql
    SELECT ...
    FROM agenda_event ae
    ...
    LEFT JOIN review r ON r.event_id = ae.id
    WHERE ... r.id IS NULL
    ```
*   **Solución Propuesta**: Similar al caso anterior. El `ReviewReminderJob` debe obtener los eventos de la agenda que están en estado de solicitar reseña y luego usar el servicio del módulo de reseñas para filtrar aquellos que ya tienen una. La consulta exitosa (#3 de la sección anterior) que solo verifica `review_id IS NULL` en `agenda_event` es el enfoque correcto a nivel de base de datos.

**3. Error de Lógica en Tipo de Recordatorio:**
*   **Job**: `appointmentReminder.job.ts`
*   **Error**: `Error: Unsupported reminder type: PHOTO_REQUEST_IMMEDIATELY`
*   **Causa**: El código del job está intentando procesar un tipo de recordatorio (`PHOTO_REQUEST_IMMEDIATELY`) que no está manejado en la lógica de `post-appointment reminders`.
*   **Solución Propuesta**: Añadir el `case` correspondiente para este tipo de recordatorio en el servicio o job que gestiona las notificaciones post-cita, o eliminar la generación de este tipo si no es soportado.

## Configuración de Desarrollo

### Variables de Entorno
```env
# Configuración de cron jobs
ENABLE_CRON_JOBS=true
CRON_TIMEZONE=America/Mexico_City

# Configuración de notificaciones
NOTIFICATION_QUEUE_NAME=notifications
EMAIL_ENABLED=true
PUSH_NOTIFICATIONS_ENABLED=true
```

### Setup Local
1. Asegurar que las migraciones estén aplicadas
2. Configurar variables de entorno
3. Verificar conexiones a bases de datos múltiples
4. Probar plantillas de email en desarrollo

## Próximas Mejoras

### Funcionalidades Planeadas
- Dashboard de métricas de notificaciones
- Configuración de preferencias por usuario
- A/B testing de plantillas de email
- Integración con analytics de engagement

### Optimizaciones Técnicas
- Implementar Redis para cache de consultas frecuentes
- Métricas de performance con Prometheus
- Alertas automáticas para fallos de jobs
- Backup y recovery de configuraciones

## Conclusión

El sistema de notificaciones programadas proporciona una base sólida para la gestión automática de comunicaciones en la plataforma Inker. Su arquitectura modular permite fácil extensión y mantenimiento, mientras que el uso de tecnologías probadas garantiza confiabilidad y escalabilidad.

---

**Versión**: 1.0  
**Fecha**: Enero 2024  
**Autor**: Sistema de Desarrollo Inker 