# Inker Backend - Agenda Event Management Summary

This document summarizes the Agenda Event Management module of the Inker backend, focusing on event creation, self-management by artists and customers, and related core functionalities. It is intended to provide context for future development and prompts.

## 1. Project Overview

The Inker backend is a service built with:
- **NestJS v9** as the primary framework.
- **Fastify** as the HTTP provider (instead of Express) for performance.
- **TypeORM** for database management and interactions.
- **Clean Architecture** principles, separating domain, infrastructure, and use cases.
- **Bull.js** for queue management, especially for asynchronous tasks like notifications.
- **WebSocket** functionality with Socket.io.
- Integration with **AWS services** and **Firebase Admin** (for notifications).
- Comprehensive testing with **Jest**.

Key architectural patterns include dependency injection, clear module separation, robust error handling, and domain exceptions.

## 2. Global Configuration (`src/config`)

Key configuration files impacting the application and agenda module include:

- **`config.ts`**: General application settings.
- **`app.config.ts`**: Defines core application settings like environment (development, production), port, API prefix, and service name. Essential for how the application runs and is accessed.
- **`auth.config.ts`**: Manages authentication settings, including JWT (secret, expiration), and API key configurations. This is crucial for securing endpoints and identifying users performing actions.
- **`database/*`**: Contains TypeORM configurations for different database connections (e.g., `ormconfig.ts`, `agenda-ormconfig.ts`). The agenda module uses a specific connection named `AGENDA_DB_CONNECTION_NAME` (defined in `src/databases/constants.ts`).
- **`queues.ts` (within `src/queues`)**: While not directly in `src/config`, it defines the Bull queue names and configurations used across the application, including the `notification` queue heavily used by the agenda module.
- **`aws.config.ts`**: Configuration for AWS services (S3, SES, SQS etc.), which might be used for storing multimedia evidence or sending emails indirectly.
- **`sendgrid.config.ts`**: API key for SendGrid, used by the `EmailNotificationService`.
- **`firebase.config.ts` (assumed location, based on Firebase Admin usage)**: Configuration for Firebase Admin SDK, used by `PushNotificationService`.

## 3. Global Module (`src/global`)

The `src/global` module provides shared utilities, base classes, and services used throughout the application:

- **`domain/exceptions/domain.exception.ts`**: Defines custom domain-specific exceptions (e.g., `DomainUnProcessableEntity`, `DomainForbiddenException`) used to handle business rule violations consistently.
- **`domain/usecases/base.usecase.ts`**: Provides a `BaseUseCase` class that other use cases can extend, likely offering common functionalities like logging.
- **`infrastructure/services/requestContext.service.ts`**: A crucial service for accessing request-specific data, such as the authenticated user's ID (`userId`), their role-specific ID (`userTypeId` - e.g., artistId or customerId), and a flag like `isNotArtist`. This service is injected into use cases to determine user identity and authorization.
- **`infrastructure/exception-filters/*`**: Contains filters to catch specific exceptions (e.g., TypeORM exceptions, domain exceptions) and format them into standardized HTTP responses.
- **`infrastructure/guards/*`**: Implements authentication and authorization guards (e.g., JWT guard) to protect routes.

## 4. Queue System (`src/queues`)

The application utilizes Bull.js for managing asynchronous jobs. Key aspects are documented in `docs/queues-and-notifications.md`.

- **Main Queues**: Defined in `src/queues/queues.ts`, including:
    - `notification`: For handling all notification-related jobs (email, push).
    - `deadLetter`: For jobs that fail repeatedly.
    - `sync`: For synchronization tasks.
    - `penalty`: For processing cancellation penalties.
- **Job Processing**: Jobs are strongly typed using Zod schemas (see `src/queues/notifications/domain/schemas/*`).
- **Notification Processor**: Located in `src/queues/notifications/application/jobs/notification.processor.ts`, it validates jobs, uses a factory to create handlers, executes them, and manages failures.
- **Job Handlers**: Specific classes implementing `NotificationJob` handle different job types (e.g., `EVENT_STATUS_CHANGED`).
- **Agenda Module Integration**: The agenda module, particularly `ChangeEventStatusUsecase`, interacts with the `notificationsQueue` to dispatch jobs when event statuses change. For example, it adds an `EVENT_STATUS_CHANGED` job with relevant metadata (eventId, customerId, artistId, new status, message).

This system ensures that operations like sending notifications do not block the main application thread and can be retried upon failure.

## 5. Agenda Event Management Module (`src/agenda`)

This module is responsible for managing appointments, scheduling, and related workflows between artists and customers.

### 5.1. Key Entities (found in `src/agenda/infrastructure/entities`)

- **`AgendaEvent` (`agendaEvent.entity.ts`)**: The central entity representing an appointment or event. It includes:
    - `id`, `title`, `description`, `startDate`, `endDate`.
    - `status`: An enum `AgendaEventStatus` (e.g., `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELED`, `RESCHEDULED`).
    - `statusLog`: An array (`IStatusLogEntry[]`) tracking the history of status changes, including actor (user and role), timestamp, reason, and notes.
    - `customerId`, `agendaId` (linking to `Agenda`), `quotationId`.
    - `locationId`, `workId`, `stencilId`.
    - `reviewId` (linking to a review once submitted).
- **`Agenda` (`agenda.entity.ts`)**: Represents an artist's agenda. Contains `artistId`.
- **`Quotation` (`quotation.entity.ts`)**: Manages the quotation process, which can lead to event creation.
- **`QuotationOffer` (`quotationOffer.entity.ts`)**: Represents offers made within a quotation.
- **`AgendaUnavailableTime` (`agendaUnavailableTime.entity.ts`)**: Stores periods when an artist is not available.
- **`CancellationPenalty` (`cancellationPenalty.entity.ts`)**: Tracks penalties applied for event cancellations.

### 5.2. Event Creation

Event creation is primarily handled by:
- **`CreateAgendaEventService` (`src/agenda/domain/services/createAgendaEvent.service.ts`)**: This service encapsulates the logic for creating new agenda events. It likely takes details such as artist, customer, time, and potentially links to a quotation or stencil. It has methods like `createEventFromQuotation` which is used in the asynchronous flow.
- **Use Cases like `AddEventUseCase` (`src/agenda/usecases/event/addEvent.usecase.ts`)**: This use case likely orchestrates the *direct* creation of an event, possibly invoking `CreateAgendaEventService` and performing other related actions like sending notifications.
- **Asynchronous Event Creation via Quotation Acceptance**:
    - When a customer accepts a quotation (either a direct quotation or an offer for an open quotation), an agenda event is created asynchronously.
    - **Triggering Use Cases**:
        - **`AcceptQuotationOfferUseCase` (`src/agenda/usecases/offer/acceptQuotationOffer.usecase.ts`)**: After successfully marking an offer as accepted and updating related entities, this use case dispatches a `CREATE_AGENDA_EVENT` job to the `syncQueue`. The job metadata includes `artistId` and `quotationId`.
        - **`ProcessCustomerActionUseCase` (`src/agenda/usecases/quotation/processCustomerAction.usecase.ts`)**: If the customer's action is `ACCEPT`, this use case also dispatches a `CREATE_AGENDA_EVENT` job to the `syncQueue` with `artistId` and `quotationId`.
    - **`SyncProcessor` (`src/queues/sync/sync.processor.ts`)**:
        - This Bull processor listens to the `syncQueue`.
        - Upon receiving a `CREATE_AGENDA_EVENT` job:
            1. It fetches the artist's `Agenda` and the full `Quotation` details (including offers if it was an `OPEN` quotation type to find the accepted offer).
            2. It validates that the quotation status is indeed `accepted` and that necessary details for scheduling are present (e.g., `appointmentDate`, `appointmentDuration` for direct quotations, or `estimatedDate`, `estimatedDuration` from the accepted offer for open quotations).
            3. It checks if an event for this quotation already exists to prevent duplicates.
            4. It calculates the event's `endDate` based on the start date and duration.
            5. It then calls `createAgendaEventService.createEventFromQuotation()` providing the agenda ID, quotation ID, customer ID, a default title/description, color, start date, and end date. This service is responsible for creating the `AgendaEvent` entity with its initial status and log.
    - This asynchronous pattern decouples event creation from the immediate quotation acceptance transaction, improving resilience.

### 5.3. Event Self-Management (Artist & Customer)

Both artists and customers can manage aspects of an event, governed by specific use cases and domain services.

#### 5.3.1. Core Use Case: `ChangeEventStatusUsecase` (`src/agenda/usecases/event/changeEventStatus.usecase.ts`)

This use case is central to modifying the status of an `AgendaEvent`.

- **Inputs**: `agendaId`, `eventId`, and a DTO (`ChangeEventStatusReqDto`) containing the `status`, `reason`, `notes`, `newStartDate`, `newEndDate`.
- **Authorization**: 
    - Relies on `RequestContextService` to get `userTypeId` (artist/customer ID), `userId` (authenticated user), and `isNotArtist`.
    - Fetches the event and its agenda to verify ownership (`event.agenda.artistId`, `event.customerId`).
    - **Cancellation/Rescheduling**: Authorized if the user is the event's artist OR the event's customer.
    - **Other Status Changes**: Authorized only if the user is the event's artist.
    - Throws `DomainUnProcessableEntity` with codes like `ARTIST_NOT_AUTHORIZED` or a generic message for unauthorized actions.
- **Status Transition Validation (`validateTransition` method)**:
    - Enforces a state machine for event statuses. Examples:
        - `SCHEDULED` -> `IN_PROGRESS`, `RESCHEDULED`, `CANCELED`.
        - `IN_PROGRESS` -> `COMPLETED`, `CANCELED`.
        - `COMPLETED` -> `WAITING_FOR_PHOTOS`.
    - Throws `DomainUnProcessableEntity` with `INVALID_EVENT_STATUS_TRANSITION` if a transition is not allowed.
- **Date Updates**: If `newStartDate` or `newEndDate` are provided (typically for rescheduling), the event's dates are updated.
- **Status Logging**: 
    - Creates a `newLogEntry` of type `IStatusLogEntry` which includes the new `status`, `timestamp`, `actor` (userId, roleId, role: 'artist' or 'customer'), `reason`, and `notes`.
    - Appends this entry to the `event.statusLog` array.
- **Persistence**: Saves the updated `event` entity (with new status and log) using `agendaEventProvider.save(event)`.
- **Notifications (`notifyCustomer` method)**:
    - If `event.customerId` exists, it queues a notification.
    - Adds a job to the `notificationsQueue` with:
        - `jobId: 'EVENT_STATUS_CHANGED'`
        - `notificationTypeId: 'EMAIL'` (this might be an example, could be more dynamic)
        - `metadata`: `eventId`, `customerId`, `artistId` (of the event), `status`, and a dynamic `message` based on the new status.
    - Handles errors during notification queuing by logging them.

#### 5.3.2. Domain Service: `EventActionEngineService` (`src/agenda/domain/services/eventActionEngine.service.ts`)

This service determines the available actions a user can perform on a specific event based on their role, the event's current state, and business rules.

- **Input**: `EventActionContext` which includes:
    - `userId`, `userType` ('artist' or 'customer').
    - `event` (the `AgendaEvent` entity, expected to have `agenda.artistId` and `customerId` populated).
    - Optionally: `quotation`, `offer`, `artist`, `stencil`, `tattooDesignCache`, `location` (though current logic focuses on event and user).
- **Output**: `EventActionsResultDto` which contains boolean flags for each possible action and a `reasons` object explaining why an action might be unavailable.
    - `canEdit`, `canCancel`, `canReschedule`, `canSendMessage`, `canAddWorkEvidence`, `canLeaveReview`.
    - (Quotation-specific actions like `canAcceptOffer`, `canRejectOffer`, `canAppeal` are currently hardcoded to `false` with a generic reason, indicating they are handled separately).
- **Key Logic & Conditions**:
    - **`isArtist` / `isCustomer`**: Determined by comparing `userId` and `userType` from context with `event.agenda.artistId` and `event.customerId`.
    - **`hoursTillAppointment`**: Calculated difference between current time and `event.startDate`.
    - **`canEdit`**: True if `isArtist` and event status is `SCHEDULED` or `RESCHEDULED`.
    - **`canCancel`**:
        - `isArtist`: True if event status is not `COMPLETED` or `CANCELED`.
        - `isCustomer`: True if `hoursTillAppointment >= 24` and event status is not `COMPLETED` or `CANCELED`.
    - **`canReschedule`**:
        - `isArtist`: True if event status is `SCHEDULED`.
        - `isCustomer`: True if event status is `SCHEDULED` and `hoursTillAppointment >= 48`.
    - **`canSendMessage`**: True if event status is `SCHEDULED`, `IN_PROGRESS`, `WAITING_FOR_PHOTOS`, `PENDING_CONFIRMATION`, or `AFTERCARE_PERIOD`.
    - **`canAddWorkEvidence`**: True if `isArtist` and event status is `WAITING_FOR_PHOTOS` or `COMPLETED`.
    - **`canLeaveReview`**: True if `isCustomer`, event status is `WAITING_FOR_REVIEW` or `COMPLETED`, and `event.reviewId` is not set.
- **Purpose**: This engine provides a centralized way to determine user capabilities for an event, which can be used by the UI to enable/disable action buttons and provide explanations.

#### 5.3.3. Other Relevant Use Cases for Event Management

Located in `src/agenda/usecases/` (primarily under `event/` and `agenda/` subdirectories):

- **`ListEventByViewTypeUseCase`**: Lists events based on different view types (e.g., calendar, list).
- **`ListEventFromArtistAgenda`**: Lists events specifically for an artist's agenda.
- **`ListEventsByArtistId`**: Lists all events associated with a given artist ID.
- **`FindEventFromArtistByEventIdUseCase`**: Retrieves a specific event for an artist.
- **`MarkEventAsDoneUseCase`**: Allows an artist to mark an event as done, likely transitioning its status towards `COMPLETED`.
- **`RsvpUseCase`**: Handles customer RSVP responses to event invitations/confirmations.
- **`UpdateEventUseCase`**: General purpose use case for updating event details (could be notes, time, etc., distinct from just status changes).
- **`UpdateEventNotesUseCase`**: Specifically for updating the notes associated with an event.
- **`RescheduleEventUseCase`**: Handles the logic for rescheduling an event, including permission checks and potentially invoking `ChangeEventStatusUsecase` with status `RESCHEDULED`.
- **`CancelEventAndApplyPenaltyUseCase`**: Manages event cancellation, including calculating and applying penalties using `PenaltyCalculationService` and potentially interacting with the `penaltyQueue`.
- **`SetWorkingHoursUseCase`, `CreateUnavailableTimeUseCase`, `GetUnavailableTimesUseCase`, `DeleteUnavailableTimeUseCase`**: Manage artist availability, which indirectly affects event scheduling.
- **`GetArtistAvailabilityUseCase`, `GetSuggestedTimeSlotsUseCase`**: Help in finding suitable times for events.

#### 5.3.4. Other Relevant Domain Services (`src/agenda/domain/services`)

- **`PenaltyCalculationService` (`penaltyCalculation.service.ts`)**: Calculates penalties for event cancellations based on predefined rules (e.g., notice period, event value).
- **`QuotationEnrichmentService` (`quotationEnrichment.service.ts`)**: While primarily for quotations, it might provide data that influences event details if an event originates from a quotation.
- **`AgendaSettingsService` and `SchedulingService` (from `src/agenda/services/`)**: These are listed in `agenda.module.ts` and likely handle higher-level scheduling logic and artist agenda settings, complementing the direct event management use cases.

This summary provides a snapshot of the agenda event management system. For detailed implementations, refer to the specific files mentioned. 