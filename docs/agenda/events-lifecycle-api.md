# Agenda Events Lifecycle API

This document describes the API endpoints for managing the lifecycle of agenda events in the Inker application.

## Event Lifecycle

Events in the system follow this lifecycle:

```
SCHEDULED → IN_PROGRESS → COMPLETED → WAITING_FOR_PHOTOS → WAITING_FOR_REVIEW → REVIEWED
```

Alternative paths:
- SCHEDULED → RESCHEDULED → SCHEDULED
- Any state → CANCELED (terminal state)

## API Endpoints

### 1. Create Event

**Endpoint:** `POST /agenda/event`

**Request Body:**
```json
{
  "agendaId": 1,
  "title": "Tattoo Session",
  "start": "2025-04-05T10:00:00Z",
  "end": "2025-04-05T12:00:00Z",
  "color": "#FF5733",
  "info": "Full sleeve tattoo session",
  "notification": true,
  "customerId": 42
}
```

**Response:** Event object with ID

### 2. Update Event

**Endpoint:** `PUT /agenda/{eventId}`

**Request Body:**
```json
{
  "title": "Updated Tattoo Session",
  "start": "2025-04-05T11:00:00Z",
  "end": "2025-04-05T13:00:00Z",
  "color": "#33FF57",
  "info": "Full sleeve tattoo session - updated",
  "notification": true
}
```

**Response:** Updated event object

### 3. Change Event Status

**Endpoint:** `PUT /agenda/{agendaId}/event/{eventId}/status`

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Optional notes about the status change"
}
```

**Status Values:**
- `scheduled`: Initial state
- `in_progress`: Tattoo session has started
- `completed`: Tattoo session is complete
- `rescheduled`: Appointment has been rescheduled
- `waiting_for_photos`: Artist is adding work evidence
- `waiting_for_review`: Ready for customer review
- `reviewed`: Customer has reviewed the session
- `canceled`: Event has been canceled

**Response:** Success message

### 4. Mark Event as Done and Upload Evidence

**Endpoint:** `PUT /agenda/{agendaId}/event/{eventId}/done`

**Request:**
- Form data with photos (files[])

**Response:** Success message

### 5. Review an Event

**Endpoint:** `POST /agenda/{agendaId}/event/{eventId}/review`

**Request Body:**
```json
{
  "rating": 4.5,
  "comment": "Great work, very satisfied with the result!",
  "displayName": "John Doe"
}
```

**Response:** Success message

### 6. Get Event Status

**Endpoint:** `GET /agenda/event/{eventId}`

**Response:** Event object with current status

### 7. RSVP for an Event

**Endpoint:** `POST /agenda/{agendaId}/event/{eventId}/rsvp?willAttend=true`

**Response:** Success message

### 8. Cancel Event

**Endpoint:** `DELETE /agenda/{agendaId}/event/{eventId}`

**Response:** Success message

## Notifications

The system automatically sends notifications to relevant parties when:

1. Event status changes
2. Event is marked as done
3. Work evidence is uploaded
4. Event is ready for review
5. Event is reviewed
6. Event is rescheduled or canceled

## Authorization

- Artists can:
  - Create, update, and cancel events
  - Change event status
  - Mark events as done and upload evidence

- Customers can:
  - RSVP to events
  - Review completed events
  - View event details

## Integration with Reviews

When an event status is changed to `WAITING_FOR_REVIEW`, the customer can submit a review. Upon review submission, the event status changes to `REVIEWED`.

The review data includes:
- Rating (1-5 stars)
- Comments
- Display name