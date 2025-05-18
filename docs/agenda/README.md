# Agenda Controller API Guide

This document provides a comprehensive guide to the Agenda API endpoints, managed by the `AgendaController`. It's intended to assist frontend AI integration by detailing request/response contracts, parameters, and usage examples.

## Authentication

All endpoints documented below require authentication. Include an `Authorization` header with a Bearer token:

`Authorization: Bearer <YOUR_JWT_TOKEN>`

## Common Responses

- **Success (200 OK, 201 Created):** Varies by endpoint, see specific documentation.
- **Default Success Response (`DefaultResponseDto`):**
  ```json
  {
    "statusCode": 200,
    "message": "Operation successful"
  }
  ```
- **Bad Request (400):** Indicates invalid input, missing parameters, or validation errors. The response body usually contains details about the error.
- **Unauthorized (401):** Missing or invalid authentication token.
- **Forbidden (403):** Authenticated user lacks permission for the action.
- **Not Found (404):** Requested resource (e.g., agenda, event) does not exist.
- **Conflict (409):** The request could not be completed due to a conflict with the current state of the target resource (e.g., invalid dates, invalid status transition).
- **Not Acceptable (406):** The request cannot be fulfilled based on the current state (e.g., event already done).

---

## Endpoints

### 1. Add Event

-   **Method & Path:** `POST /agenda/event`
-   **Description:** Add a new event to an agenda.
-   **Request Body:** `AddEventReqDto`
    ```json
    {
      "agendaId": "uuid-agenda-123",
      "title": "Tattoo Session with Jane Doe",
      "description": "Consultation and small design",
      "startDateTime": "2024-08-01T10:00:00.000Z",
      "endDateTime": "2024-08-01T11:00:00.000Z",
      "customerId": "uuid-customer-789",
      "type": "TATTOO_SESSION", // Example: "TATTOO_SESSION", "CONSULTATION"
      "location": "Studio A", // Optional
      "price": 50.00 // Optional
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST \
      https://your-api-domain.com/agenda/event \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "agendaId": "uuid-agenda-123",
            "title": "Tattoo Session with Jane Doe",
            "description": "Consultation and small design",
            "startDateTime": "2024-08-01T10:00:00.000Z",
            "endDateTime": "2024-08-01T11:00:00.000Z",
            "customerId": "uuid-customer-789",
            "type": "TATTOO_SESSION",
            "location": "Studio A",
            "price": 50.00
          }'
    ```
-   **Response:** `200 OK`. The response body structure depends on the handler implementation (likely contains the created event details or a success message).

### 2. Update Event

-   **Method & Path:** `PUT /agenda/event/:id`
-   **Description:** Update an existing event.
-   **Path Parameters:**
    -   `id`: (string, UUID) Event ID. Example: `uuid-event-456`
-   **Request Body:** `UpdateEventReqDto`
    ```json
    {
      "title": "Updated Tattoo Session",
      "description": "Finalizing sleeve design",
      "startDateTime": "2024-08-02T14:00:00.000Z",
      "endDateTime": "2024-08-02T18:00:00.000Z",
      "location": "Studio B", // Optional
      "price": 300.00 // Optional
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT \
      https://your-api-domain.com/agenda/event/uuid-event-456 \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "title": "Updated Tattoo Session",
            "description": "Finalizing sleeve design",
            "startDateTime": "2024-08-02T14:00:00.000Z",
            "endDateTime": "2024-08-02T18:00:00.000Z",
            "location": "Studio B",
            "price": 300.00
          }'
    ```
-   **Response:** `200 OK`. The response body structure depends on the handler implementation (likely updated event details or success message).

### 3. Cancel Event

-   **Method & Path:** `DELETE /agenda/:agendaId/event/:eventId`
-   **Description:** Cancel an event.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID. Example: `uuid-agenda-123`
    -   `eventId`: (string, UUID) Event ID. Example: `uuid-event-456`
-   **Request Body:** `CancelEventReqDto`
    ```json
    {
      "reason": "Customer requested cancellation due to an emergency."
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X DELETE \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456 \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "reason": "Customer requested cancellation due to an emergency."
          }'
    ```
-   **Response:** `200 OK`. The response body structure depends on the handler implementation (likely success message).

### 4. List Events by View Type (Week/Day for a specific Agenda)

-   **Method & Path:** `GET /agenda/:agendaId`
-   **Description:** List events for a specific agenda, filterable by week or day.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID. Example: `uuid-agenda-123`
-   **Query Parameters:** `ListEventByViewTypeQueryDto`
    -   `viewType`: (string) "day" or "week".
    -   `date`: (string) Date in YYYY-MM-DD format to anchor the view.
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/uuid-agenda-123?viewType=week&date=2024-08-01" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. Array of event objects.
    ```json
    [
      // Example event object structure
      {
        "id": "uuid-event-1",
        "title": "Session 1",
        "startDateTime": "2024-08-01T10:00:00Z",
        "endDateTime": "2024-08-01T12:00:00Z",
        // ... other event properties
      }
    ]
    ```

### 5. List All Events for Authenticated User (Artist or Customer)

-   **Method & Path:** `GET /agenda`
-   **Description:** Get all events from the authenticated user's agenda (if artist) or events they are part of (if customer).
-   **Query Parameters:**
    -   `status`: (string, optional) Filter events by status (e.g., "SCHEDULED", "COMPLETED", "CANCELED").
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda?status=SCHEDULED" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. Array of event objects (similar to above).

### 6. List Events by Artist ID (Public View)

-   **Method & Path:** `GET /agenda/artist/:artistId`
-   **Description:** Get all events for a specific artist ID. (Typically public or semi-public events).
-   **Path Parameters:**
    -   `artistId`: (string, UUID) Artist's User ID. Example: `uuid-artist-XYZ`
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/artist/uuid-artist-XYZ" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. Array of event objects.

### 7. Get Event by Event ID

-   **Method & Path:** `GET /agenda/event/:eventId`
-   **Description:** Get details for a specific event.
-   **Path Parameters:**
    -   `eventId`: (string, UUID) Event ID. Example: `uuid-event-789`
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/event/uuid-event-789" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. A single event object. The response will also include an `actions` object detailing available operations for the current user regarding this event.
    ```json
    {
      "event": {
        "id": "uuid-event-789",
        "title": "Session Details",
        "startDateTime": "2024-08-03T10:00:00Z",
        "endDateTime": "2024-08-03T12:00:00Z",
        "status": "CONFIRMED",
        // ... other event properties
      },
      "location": { /* ... location details ... */ },
      "quotation": { /* ... quotation details or null ... */ },
      "actions": {
        "canEdit": false,
        "canCancel": true,
        "canReschedule": true,
        "canSendMessage": true,
        "canAddWorkEvidence": false,
        "canLeaveReview": false,
        "canConfirmEvent": false,
        "canRejectEvent": false,
        "canAppeal": false,
        "reasons": {
          "canEdit": "Only artists can modify event details during the confirmed or rescheduled phase.",
          "canAddWorkEvidence": "Work evidence can only be added when the event is awaiting photos or marked as completed.",
          "canLeaveReview": "Reviews can only be left after the session is awaiting review or completed.",
          "canConfirmEvent": "Event confirmation is only available when the event is pending confirmation.",
          "canRejectEvent": "Event rejection is only available when the event is pending confirmation.",
          "canAppeal": "Appeal actions are handled separately from event actions."
        }
      }
    }
    ```

### 8. Get Customer Event by Event ID

-   **Method & Path:** `GET /agenda/customer/event/:eventId`
-   **Description:** Get details for a specific event, tailored for customer view.
-   **Path Parameters:**
    -   `eventId`: (string, UUID) Event ID. Example: `uuid-event-789`
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/customer/event/uuid-event-789" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. A single event object, potentially with filtered information for customers. The response will also include an `actions` object detailing available operations for the current user regarding this event.
    ```json
    {
      "event": {
        "id": "uuid-event-789",
        "title": "My Tattoo Session",
        "startDateTime": "2024-08-03T10:00:00Z",
        "endDateTime": "2024-08-03T12:00:00Z",
        "status": "CONFIRMED",
        // ... other event properties
      },
      "artist": { /* ... artist details ... */ },
      "location": { /* ... location details ... */ },
      "quotation": { /* ... quotation details or null ... */ },
      "actions": {
        "canEdit": false,
        "canCancel": true,
        "canReschedule": true,
        "canSendMessage": true,
        "canAddWorkEvidence": false,
        "canLeaveReview": false,
        "canConfirmEvent": false,
        "canRejectEvent": false,
        "canAppeal": false,
        "reasons": {
          "canEdit": "Only artists can modify event details during the confirmed or rescheduled phase.",
          "canAddWorkEvidence": "Only artists can add work evidence.",
          "canLeaveReview": "Reviews can only be left after the session is awaiting review or completed.",
          "canConfirmEvent": "Event confirmation is only available when the event is pending confirmation.",
          "canRejectEvent": "Event rejection is only available when the event is pending confirmation.",
          "canAppeal": "Appeal actions are handled separately from event actions."
        }
      }
    }
    ```

### 9. Mark Event as Done

-   **Method & Path:** `PUT /agenda/:agendaId/event/:eventId/done`
-   **Description:** Mark an event as done. This is typically done by the artist. Can include work evidence files.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID. Example: `uuid-agenda-123`
    -   `eventId`: (string, UUID) Event ID. Example: `uuid-event-456`
-   **Request Body (form-data for file upload):**
    -   `files[]`: (File, optional) Array of work evidence files.
-   **Example `curl` (with file upload):**
    ```bash
    curl -X PUT \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/done \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -F "files[]=@/path/to/image1.jpg" \
      -F "files[]=@/path/to/image2.png"
    ```
-   **Response:** `200 OK`. Typically `DefaultResponseDto`.
    ```json
    {
      "statusCode": 200,
      "message": "Event marked as done successful."
    }
    ```

### 10. Get Work Evidence by Artist ID

-   **Method & Path:** `GET /agenda/artists/:artistId/work-evidence`
-   **Description:** Get paginated work evidence (completed event images) for an artist.
-   **Path Parameters:**
    -   `artistId`: (string, UUID) Artist's User ID. Example: `uuid-artist-XYZ`
-   **Query Parameters:**
    -   `page`: (number, optional) Page number. Default: `1`.
    -   `limit`: (number, optional) Items per page. Default: `6`.
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/artists/uuid-artist-XYZ/work-evidence?page=1&limit=10" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. `GetWorkEvidenceByArtistIdResponseDto`
    ```json
    {
      "data": [
        {
          "eventId": "uuid-event-1",
          "imageUrl": "https://example.com/work1.jpg",
          "createdAt": "2024-07-10T10:00:00Z"
          // ... other relevant fields
        }
      ],
      "meta": {
        "totalItems": 50,
        "itemCount": 10,
        "itemsPerPage": 10,
        "totalPages": 5,
        "currentPage": 1
      }
    }
    ```

### 11. RSVP to an Event (Deprecated)

-   **Method & Path:** `PUT /agenda/:agendaId/event/:eventId/rsvp`
-   **Description:** (Deprecated) Use `confirm` or `reject` endpoints instead.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Query Parameters:**
    -   `willAttend`: (boolean) `true` to accept, `false` to decline.
-   **Response:** `200 OK`. `DefaultResponseDto`.

### 12. Change Event Status

-   **Method & Path:** `PUT /agenda/:agendaId/event/:eventId/status`
-   **Description:** Manually change the status of an event (e.g., by an admin or based on specific logic).
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Request Body:** `ChangeEventStatusReqDto`
    ```json
    {
      "status": "CONFIRMED", // e.g., "SCHEDULED", "CONFIRMED", "CANCELED", "RESCHEDULED_PENDING_APPROVAL"
      "reason": "Customer confirmed attendance via phone." // Optional
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/status \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "status": "CONFIRMED",
            "reason": "Customer confirmed attendance via phone."
          }'
    ```
-   **Response:** `200 OK`. Response body structure depends on the handler.

### 13. Review an Event

-   **Method & Path:** `POST /agenda/:agendaId/event/:eventId/review`
-   **Description:** Allow a user (typically customer) to review a completed event/artist.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Request Body:** `ReviewArtistRequestDto` (from `reviews` module)
    ```json
    {
      "rating": 5, // Integer, typically 1-5
      "comment": "Absolutely loved the tattoo! The artist was fantastic.",
      "isAnonymous": false // boolean
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/review \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "rating": 5,
            "comment": "Absolutely loved the tattoo! The artist was fantastic.",
            "isAnonymous": false
          }'
    ```
-   **Response:** `200 OK`. Response body structure depends on the handler (likely the created review or success message).

### 14. Set Working Hours and Days

-   **Method & Path:** `PUT /agenda/:agendaId/working-hours`
-   **Description:** Artist sets their working hours and days for their agenda.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
-   **Request Body:** `SetWorkingHoursReqDto`
    ```json
    {
      "workingHours": [
        { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isWorkingDay": true }, // Monday (1=Monday, 7=Sunday or 0=Sunday, adjust based on system)
        { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00", "isWorkingDay": true },
        { "dayOfWeek": 3, "startTime": "10:00", "endTime": "18:00", "isWorkingDay": true },
        { "dayOfWeek": 4, "isWorkingDay": false }, // Off day
        { "dayOfWeek": 5, "startTime": "09:00", "endTime": "17:00", "isWorkingDay": true },
        { "dayOfWeek": 6, "startTime": "10:00", "endTime": "15:00", "isWorkingDay": true }, // Saturday
        { "dayOfWeek": 7, "isWorkingDay": false }  // Sunday
      ],
      "timeZone": "America/New_York" // IANA Time Zone
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT \
      https://your-api-domain.com/agenda/uuid-agenda-123/working-hours \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{ /* See SetWorkingHoursReqDto example above */ }'
    ```
-   **Response:** `200 OK`. No response body (`void`).

### 15. Create Unavailable Time Block

-   **Method & Path:** `POST /agenda/:agendaId/unavailable-time`
-   **Description:** Artist blocks out time in their agenda (e.g., for breaks, personal appointments).
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
-   **Request Body:** `CreateUnavailableTimeReqDto`
    ```json
    {
      "title": "Lunch Break",
      "startTime": "2024-08-01T12:00:00.000Z",
      "endTime": "2024-08-01T13:00:00.000Z",
      "isAllDay": false,
      "repeatType": "NONE" // "NONE", "DAILY", "WEEKLY", "MONTHLY"
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X POST \
      https://your-api-domain.com/agenda/uuid-agenda-123/unavailable-time \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "title": "Lunch Break",
            "startTime": "2024-08-01T12:00:00.000Z",
            "endTime": "2024-08-01T13:00:00.000Z",
            "isAllDay": false,
            "repeatType": "NONE"
          }'
    ```
-   **Response:** `200 OK`. `AgendaUnavailableTime` entity.
    ```json
    {
      "id": "uuid-unavailable-time-1",
      "agendaId": "uuid-agenda-123",
      "title": "Lunch Break",
      "startTime": "2024-08-01T12:00:00.000Z",
      "endTime": "2024-08-01T13:00:00.000Z",
      "isAllDay": false,
      "repeatType": "NONE"
      // ... other properties
    }
    ```

### 16. Get Unavailable Time Blocks

-   **Method & Path:** `GET /agenda/:agendaId/unavailable-time`
-   **Description:** Retrieve all unavailable time blocks for an agenda.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/uuid-agenda-123/unavailable-time" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. Array of `AgendaUnavailableTime` entities.

### 17. Delete Unavailable Time Block

-   **Method & Path:** `DELETE /agenda/:agendaId/unavailable-time/:id`
-   **Description:** Delete a specific unavailable time block.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `id`: (string, UUID) Unavailable Time Block ID.
-   **Example `curl`:**
    ```bash
    curl -X DELETE \
      "https://your-api-domain.com/agenda/uuid-agenda-123/unavailable-time/uuid-unavailable-time-1" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. No response body (`void`).

### 18. Reschedule an Event

-   **Method & Path:** `PUT /agenda/:agendaId/event/:eventId/reschedule`
-   **Description:** Request to reschedule an existing event.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Request Body:** `RescheduleEventReqDto`
    ```json
    {
      "newStartDateTime": "2024-08-05T10:00:00.000Z",
      "newEndDateTime": "2024-08-05T12:00:00.000Z",
      "reason": "Artist availability changed." // Optional
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/reschedule \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "newStartDateTime": "2024-08-05T10:00:00.000Z",
            "newEndDateTime": "2024-08-05T12:00:00.000Z",
            "reason": "Artist availability changed."
          }'
    ```
-   **Response:** `200 OK`. No response body (`void`). May trigger notifications or state changes.

### 19. Update Event Notes

-   **Method & Path:** `PUT /agenda/:agendaId/event/:eventId/notes`
-   **Description:** Update internal notes for an event.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Request Body:** `UpdateEventNotesReqDto`
    ```json
    {
      "notes": "Customer confirmed they prefer a specific stencil. Attached to profile."
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/notes \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "notes": "Customer confirmed they prefer a specific stencil. Attached to profile."
          }'
    ```
-   **Response:** `200 OK`. No response body (`void`).

### 20. Get Artist Availability

-   **Method & Path:** `GET /agenda/artists/:artistId/availability`
-   **Description:** Retrieve the availability calendar for an artist.
-   **Path Parameters:**
    -   `artistId`: (string, UUID) Artist's User ID.
-   **Query Parameters:** `ArtistAvailabilityQueryDto`
    -   `fromDate`: (string) YYYY-MM-DD format.
    -   `toDate`: (string) YYYY-MM-DD format.
    -   `duration`: (number, optional) Duration in minutes to check for available slots.
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/artists/uuid-artist-XYZ/availability?fromDate=2024-08-01&toDate=2024-08-07&duration=120" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. Array of `AvailabilityCalendar` objects.
    ```json
    [
      {
        "date": "2024-08-01",
        "isWorkingDay": true,
        "slots": [
          { "startTime": "2024-08-01T10:00:00Z", "endTime": "2024-08-01T12:00:00Z", "isAvailable": true },
          { "startTime": "2024-08-01T14:00:00Z", "endTime": "2024-08-01T16:00:00Z", "isAvailable": true }
        ]
      }
      // ... other days
    ]
    ```

### 21. Get Artist Available Time Slots (Suggestions)

-   **Method & Path:** `GET /agenda/artists/:artistId/available-slots`
-   **Description:** Get suggested available time slots for an artist.
-   **Path Parameters:**
    -   `artistId`: (string, UUID) Artist's User ID.
-   **Query Parameters:**
    -   `date`: (string, optional) YYYY-MM-DD. If provided, suggestions start from this date. Otherwise, today.
    -   `duration`: (number, optional) Duration in minutes. Default: `60`.
    -   `suggestionsCount`: (number, optional) Number of suggestions. Default: `8`.
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/artists/uuid-artist-XYZ/available-slots?date=2024-08-01&duration=90&suggestionsCount=5" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. Array of `TimeSlot` objects.
    ```json
    [
      { "startTime": "2024-08-01T10:00:00.000Z", "endTime": "2024-08-01T11:30:00.000Z" },
      { "startTime": "2024-08-01T14:00:00.000Z", "endTime": "2024-08-01T15:30:00.000Z" }
      // ... other suggested slots
    ]
    ```

### 22. Get Agenda Settings

-   **Method & Path:** `GET /agenda/:agendaId/settings`
-   **Description:** Get settings for a specific agenda, including working hours and visibility.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/uuid-agenda-123/settings" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. `GetAgendaSettingsResDto`.
    ```json
    {
      "agendaId": "uuid-agenda-123",
      "workingHours": [ /* ... array of working hour objects ... */ ],
      "timeZone": "America/New_York",
      "visibility": "PUBLIC", // "PUBLIC", "PRIVATE"
      "isOpen": true // boolean, if agenda is open for new bookings/events
    }
    ```

### 23. Update Agenda Settings

-   **Method & Path:** `PUT /agenda/:agendaId/settings`
-   **Description:** Update agenda visibility and open/closed status.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
-   **Request Body:** `UpdateAgendaSettingsReqDto`
    ```json
    {
      "visibility": "PRIVATE", // "PUBLIC" or "PRIVATE"
      "isOpen": false // true or false
    }
    ```
-   **Example `curl`:**
    ```bash
    curl -X PUT \
      https://your-api-domain.com/agenda/uuid-agenda-123/settings \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "visibility": "PRIVATE",
            "isOpen": false
          }'
    ```
-   **Response:** `200 OK`. No response body (`void`).

### 24. Confirm Event Invitation

-   **Method & Path:** `POST /agenda/:agendaId/events/:eventId/confirm`
-   **Description:** Confirm attendance or acceptance of an event invitation. **Note:** For an event to be successfully confirmed, any required consent forms associated with the event must have been signed by the customer. The system will verify this before allowing the event status to change to `CONFIRMED`.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Example `curl`:**
    ```bash
    curl -X POST \
      "https://your-api-domain.com/agenda/uuid-agenda-123/events/uuid-event-789/confirm" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. `DefaultResponseDto`.

### 25. Reject Event Invitation

-   **Method & Path:** `POST /agenda/:agendaId/events/:eventId/reject`
-   **Description:** Reject an event invitation.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Example `curl`:**
    ```bash
    curl -X POST \
      "https://your-api-domain.com/agenda/uuid-agenda-123/events/uuid-event-789/reject" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. `DefaultResponseDto`.

### 26. Send Message to Event Chat

-   **Method & Path:** `POST /agenda/:agendaId/event/:eventId/message`
-   **Description:** Send a message to the chat associated with an event. Can include an image.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Request Body (form-data for message and optional file):**
    -   `message`: (string) The text message. (Part of `SendEventMessageReqDto`)
    -   `imageFile`: (File, optional) An image file to attach.
-   **Example `curl` (text message):**
    ```bash
    curl -X POST \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/message \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
            "message": "Looking forward to our session!"
          }'
    ```
-   **Example `curl` (with image):**
    ```bash
    curl -X POST \
      https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/message \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
      -F "message=Check out this reference image." \
      -F "imageFile=@/path/to/reference.jpg"
    ```
-   **Response:** `200 OK`. Response structure depends on handler (likely the sent message or success DTO).

### 27. Get Messages for Event Chat

-   **Method & Path:** `GET /agenda/:agendaId/event/:eventId/messages`
-   **Description:** Retrieve messages for a specific event chat.
-   **Path Parameters:**
    -   `agendaId`: (string, UUID) Agenda ID.
    -   `eventId`: (string, UUID) Event ID.
-   **Example `curl`:**
    ```bash
    curl -X GET \
      "https://your-api-domain.com/agenda/uuid-agenda-123/event/uuid-event-456/messages" \
      -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
    ```
-   **Response:** `200 OK`. Array of `EventMessageDto`.
    ```json
    [
      {
        "id": "uuid-message-1",
        "eventId": "uuid-event-456",
        "senderId": "uuid-user-sender",
        "senderType": "ARTIST", // or "CUSTOMER"
        "message": "Hello!",
        "imageUrl": null, // or "https://example.com/image.jpg"
        "createdAt": "2024-07-15T12:00:00.000Z"
      },
      {
        "id": "uuid-message-2",
        "eventId": "uuid-event-456",
        "senderId": "uuid-user-customer",
        "senderType": "CUSTOMER",
        "message": "Hi there! Looking forward to it.",
        "imageUrl": null,
        "createdAt": "2024-07-15T12:05:00.000Z"
      }
    ]
    ```

---

This guide should cover the primary interactions with the Agenda API. For DTOs not fully expanded here, refer to their definitions in the codebase (primarily under `src/agenda/infrastructure/dtos/` and `src/global/infrastructure/dtos/`).

## Important Business Logic Considerations

*   **Event Confirmation and Consents:** Please note that for certain event state transitions, such as moving from `PENDING_CONFIRMATION` to `CONFIRMED`, the system enforces that all required consent forms for that event must be signed by the customer. Attempts to confirm an event without the necessary signed consents will be prevented. 