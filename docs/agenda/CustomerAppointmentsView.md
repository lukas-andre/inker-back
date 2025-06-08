# API Guide: Customer Appointments View

This document provides the technical specification for the customer-facing appointments endpoint. It's designed to give frontend developers all the information needed to build a rich, user-centric appointments page.

## Endpoint

-   **Method & Path:** `GET /agenda`
-   **User Role:** `CUSTOMER`
-   **Authentication:** Required (Bearer Token)

---

## Overview

When a user with the `CUSTOMER` role calls this endpoint, it returns a structured and enriched view of their appointments. Instead of a flat list, the data is pre-processed and grouped to be easily consumed by the UI, enabling features like a "hero" appointment, temporal grouping, and contextual alerts.

---

## Response DTO: `GetCustomerAppointmentsViewResDto`

The main response object has two top-level properties:

1.  `heroAppointment`: A single, enriched appointment object (`CustomerAppointmentDto`) that represents the most important item for the user to see immediately. Can be `null` if there are no upcoming appointments.
2.  `appointments`: An object containing the user's appointments, grouped into five categories.

### Response Structure

```json
{
  "heroAppointment": { ...CustomerAppointmentDto... } | null,
  "appointments": {
    "requiringAction": [ ...CustomerAppointmentDto... ],
    "today": [ ...CustomerAppointmentDto... ],
    "thisWeek": [ ...CustomerAppointmentDto... ],
    "upcoming": [ ...CustomerAppointmentDto... ],
    "history": [ ...CustomerAppointmentDto... ]
  }
}
```

---

## Enriched Appointment DTO: `CustomerAppointmentDto`

Each appointment within the response is not a raw database entity, but an enriched `CustomerAppointmentDto` with the following structure:

```typescript
class CustomerAppointmentDto {
  event: AgendaEvent; // The original, raw event object
  urgency: AppointmentUrgencyLevel; // An enum indicating the visual priority
  contextualInfo: AppointmentContextualInfo; // An object with human-readable texts
  availableActions: ('CONFIRM' | 'LEAVE_REVIEW' | 'VIEW_DETAILS')[]; // A list of primary actions
}
```

### 1. `event: AgendaEvent`

This is the standard `AgendaEvent` entity containing all the core data about the appointment (ID, title, dates, status, etc.).

### 2. `urgency: AppointmentUrgencyLevel`

An enum that the frontend should use to apply visual styling (colors, icons, highlights).

| Urgency Level | When It's Used                                               | UI Suggestion       |
| :------------ | :----------------------------------------------------------- | :------------------ |
| `CRITICAL`    | The user must take action (e.g., confirm, leave a review).   | Red alert, badge    |
| `URGENT`      | The appointment is less than 24 hours away.                  | Orange/amber alert  |
| `UPCOMING`    | The appointment is between 24 and 72 hours away.             | Blue info indicator |
| `INFO`        | A standard upcoming appointment more than 3 days away, or an event that is in progress (e.g., waiting for photos) but requires no action. | Neutral/no special styling |
| `PAST`        | The appointment is in the past (completed, canceled).        | Grayed out, muted   |

### 3. `contextualInfo: AppointmentContextualInfo`

An object containing ready-to-use texts for the UI, saving the frontend from having to implement complex business logic.

```typescript
class AppointmentContextualInfo {
  title: string;          // A short, bold-able title. E.g., "¡Deja tu Reseña!"
  message: string;        // A longer, friendly description. E.g., "Nos encantaría saber cómo fue tu experiencia..."
  tip?: string;           // An optional, helpful tip for the user. E.g., "Come algo ligero antes de la sesión..."
}
```

### 4. `availableActions: AppointmentAction[]`

This is a new field that provides a simplified list of the **primary actions** the user can take directly from a list view. This saves the frontend from having to calculate this based on event status. The UI should use this array to render the main call-to-action button for an appointment card.

| Action           | When It's Used                                                    | UI Suggestion                      |
| :--------------- | :---------------------------------------------------------------- | :--------------------------------- |
| `CONFIRM`        | The event has a status of `PENDING_CONFIRMATION`.                 | A prominent "Confirm" button.      |
| `LEAVE_REVIEW`   | The event has a status of `WAITING_FOR_REVIEW`.                   | A "Leave Review" or "Rate" button. |
| `VIEW_DETAILS`   | This is the default action for any event that is not `CRITICAL`.  | A "View Details" or "Manage" button. |

All other, more granular actions (like canceling, rescheduling, sending a message) should only be displayed on the detailed view of the appointment, not in the list.

---

## Business Logic Summary

### `heroAppointment` Selection

-   The `heroAppointment` is selected based on a priority score.
-   **Highest priority:** Any appointment with `urgency: CRITICAL`.
-   **Next priority:** The closest upcoming appointment (today > this week > future).
-   If there are no upcoming appointments, `heroAppointment` will be `null`.

### Grouping Logic (`appointments`)

-   `requiringAction`: All appointments where `urgency` is `CRITICAL`.
-   `today`: Upcoming appointments scheduled for today.
-   `thisWeek`: Upcoming appointments for the rest of the current week (Monday-Sunday).
-   `upcoming`: All other future appointments beyond this week.
-   `history`: All past appointments. This list is sorted in reverse chronological order (most recent first).

---

## Example Full Response

```json
{
  "heroAppointment": {
    "event": {
      "id": "uuid-event-confirm-123",
      "title": "Tattoo de antebrazo",
      "startDate": "2024-09-20T15:00:00.000Z",
      "status": "PENDING_CONFIRMATION",
      "...": "..."
    },
    "urgency": "CRITICAL",
    "contextualInfo": {
      "title": "Requiere Confirmación",
      "message": "El artista ha enviado los detalles de la cita. Por favor, confirma tu asistencia para asegurar tu lugar.",
      "tip": "Revisa las imágenes de referencia y anota cualquier pregunta que tengas para el artista."
    },
    "availableActions": ["CONFIRM"]
  },
  "appointments": {
    "requiringAction": [
      {
        "event": { "id": "uuid-event-confirm-123", "...": "..." },
        "urgency": "CRITICAL",
        "contextualInfo": { "title": "Requiere Confirmación", "...": "..." },
        "availableActions": ["CONFIRM"]
      },
      {
        "event": { "id": "uuid-event-review-456", "status": "WAITING_FOR_REVIEW", "...": "..." },
        "urgency": "CRITICAL",
        "contextualInfo": { "title": "¡Deja tu Reseña!", "...": "..." },
        "availableActions": ["LEAVE_REVIEW"]
      }
    ],
    "today": [
      {
        "event": { "id": "uuid-event-today-789", "startDate": "...", "...": "..." },
        "urgency": "URGENT",
        "contextualInfo": { "title": "¡Tu Cita es Pronto!", "message": "Tu cita es en menos de 24 horas. ¡Prepárate!", "tip": "Come algo ligero..." },
        "availableActions": ["VIEW_DETAILS"]
      }
    ],
    "thisWeek": [],
    "upcoming": [
       {
        "event": { "id": "uuid-event-future-abc", "startDate": "...", "...": "..." },
        "urgency": "INFO",
        "contextualInfo": { "title": "Cita Programada", "message": "Todo está en orden para tu próxima cita." },
        "availableActions": ["VIEW_DETAILS"]
      }
    ],
    "history": [
      {
        "event": { "id": "uuid-event-past-def", "status": "COMPLETED", "...": "..." },
        "urgency": "PAST",
        "contextualInfo": { "title": "Cita Finalizada", "message": "Esta cita del 15/08/2024 está en tu historial." },
        "availableActions": ["VIEW_DETAILS"]
      }
    ]
  }
}
``` 