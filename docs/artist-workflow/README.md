# Artist Workflow Frontend Implementation Guide

This document provides implementation details for the frontend to integrate with the new Artist Workflow backend features. The improvements focus on three key areas:

1. **Calendar Enhancement**
2. **Appointment Management**
3. **Automated Scheduling**

## API Endpoints Overview

### Calendar Enhancement

#### Working Hours & Days Management
- `PUT /agenda/:agendaId/working-hours` - Set working hours and days
  - Request body: 
    ```json
    {
      "workingHoursStart": "09:00",
      "workingHoursEnd": "18:00",
      "workingDays": ["1", "2", "3", "4", "5"]
    }
    ```

#### Unavailable Time Management
- `POST /agenda/:agendaId/unavailable-time` - Block out unavailable time
  - Request body:
    ```json
    {
      "startDate": "2024-03-10T09:00:00Z",
      "endDate": "2024-03-10T18:00:00Z",
      "reason": "Vacation"
    }
    ```
- `GET /agenda/:agendaId/unavailable-time` - List unavailable time blocks
- `DELETE /agenda/:agendaId/unavailable-time/:id` - Remove unavailable time block

#### Agenda Public/Private & Open/Closed Settings
- `PUT /agenda/:agendaId/settings` - Update agenda visibility and availability
  - Request body:
    ```json
    {
      "public": true,    // Whether customers can view the artist's calendar
      "open": true       // Whether the artist is accepting new appointments
    }
    ```

### Appointment Management

#### Appointment Rescheduling
- `PUT /agenda/:agendaId/event/:eventId/reschedule` - Reschedule an appointment
  - Request body:
    ```json
    {
      "newStartDate": "2024-03-15T10:00:00Z",
      "newEndDate": "2024-03-15T12:00:00Z",
      "reason": "Artist scheduling conflict"
    }
    ```

#### Appointment Notes
- `PUT /agenda/:agendaId/event/:eventId/notes` - Update appointment notes
  - Request body:
    ```json
    {
      "notes": "Customer prefers black ink only. Sensitive to certain inks."
    }
    ```

### Automated Scheduling

#### Artist Availability
- `GET /agenda/artists/:artistId/availability` - Get artist availability calendar
  - Query params:
    - `fromDate`: Start date (optional, defaults to today)
    - `toDate`: End date (optional, defaults to 30 days from start)
    - `duration`: Appointment duration in minutes (optional, defaults to 60)
  - Response:
    ```json
    [
      {
        "date": "2024-03-10",
        "slots": [
          {
            "startTime": "2024-03-10T10:00:00Z",
            "endTime": "2024-03-10T11:00:00Z"
          },
          {
            "startTime": "2024-03-10T14:00:00Z",
            "endTime": "2024-03-10T15:00:00Z"
          }
        ]
      }
    ]
    ```

#### Suggested Time Slots
- `GET /quotations/:id/available-slots` - Get suggested time slots for a quotation
  - Response:
    ```json
    [
      {
        "startTime": "2024-03-10T10:00:00Z",
        "endTime": "2024-03-10T12:00:00Z",
        "density": 0.5
      }
    ]
    ```

## Frontend Implementation Guidelines

### 1. Calendar Enhancement

#### Artist Calendar Settings Screen
Create a screen with the following components:

1. **Working Hours Section**
   - Time pickers for start/end times
   - Day of week selector (multiple selection)
   - Save button to update working hours
   
2. **Time Block Management**
   - List of existing unavailable time blocks with delete option
   - Form to add new unavailable time blocks with:
     - Date range picker
     - Time range picker 
     - Reason field (optional)
     - Save button

3. **Agenda Visibility Settings**
   - Toggle for "Public Calendar" (allows customers to see availability)
   - Toggle for "Open for Appointments" (allows new bookings)

#### Calendar View Enhancements
Update the calendar view to:

1. Display unavailable times with distinct styling (e.g., grey blocks)
2. Show working hours/days appropriately
3. Reflect the correct color coding based on appointment status
4. Add a legend explaining the color coding

### 2. Appointment Management

#### Appointment Details Screen
Enhance the appointment details view with:

1. **Notes Section**
   - Text area for appointment notes
   - Save button for updating notes
   
2. **Reschedule Option**
   - "Reschedule" button that opens a modal with:
     - Date & time pickers for new dates
     - Reason field
     - Submit and Cancel buttons
   - Confirmation dialog before finalizing

3. **Appointment Status Workflow**
   - Clear indicators of current status
   - One-click status change buttons for common transitions
   - Upload evidence button for marking appointments as completed

### 3. Automated Scheduling

#### Customer Booking Flow

1. **Availability Calendar**
   - When a quotation is accepted, show an availability calendar displaying all available time slots
   - Calendar should filter slots based on artist's:
     - Working hours
     - Existing appointments
     - Unavailable time blocks
   
2. **Suggested Times Component**
   - Highlight "Recommended" time slots at the top
   - Show slots sorted by optimal timing (low schedule density)
   
3. **Booking Confirmation**
   - Date & time summary
   - Cancellation policy reminder
   - Confirm button to create the appointment

#### Artist Quotation Acceptance

1. When an artist accepts a quotation, prompt them to:
   - Select an appointment date/time directly, or
   - Allow customer to choose from available slots

## UI/UX Recommendations

1. **Color Coding**
   - Scheduled appointments: Blue
   - In-progress: Orange
   - Completed: Green
   - Rescheduled: Purple
   - Cancelled: Red
   - Unavailable time blocks: Grey

2. **Calendar Views**
   - Day view: Detailed hour-by-hour breakdown
   - Week view: Daily overview with time blocks
   - Month view: High-level summary with dot indicators

3. **Mobile Optimizations**
   - Simplify calendar to one view type on mobile
   - Use fullscreen modals for adding/editing
   - Implement swipe gestures for navigation

## Data Models

### Frontend Models

```typescript
// Agenda Settings
interface AgendaSettings {
  workingHoursStart: string;  // HH:MM format
  workingHoursEnd: string;    // HH:MM format
  workingDays: string[];      // ["1", "2", "3", "4", "5"] => Mon-Fri
  public: boolean;            // Whether visible to customers
  open: boolean;              // Whether accepting new appointments
}

// Unavailable Time Block
interface UnavailableTimeBlock {
  id: number;
  startDate: string;          // ISO date string
  endDate: string;            // ISO date string
  reason?: string;
}

// Time Slot
interface TimeSlot {
  startTime: string;          // ISO date string
  endTime: string;            // ISO date string
  density?: number;           // Lower is better (fewer nearby appointments)
}

// Availability Calendar
interface AvailabilityDay {
  date: string;               // YYYY-MM-DD
  slots: TimeSlot[];
}
```

## Implementation Phases

We recommend implementing these features in the following order:

1. **Phase 1: Calendar Infrastructure**
   - Working hours & days management
   - Calendar view enhancements
   - Public/private & open/closed toggles

2. **Phase 2: Appointment Management**
   - Appointment notes
   - Rescheduling functionality
   - Extend appointment status workflow

3. **Phase 3: Automated Scheduling**
   - Availability calculation & display
   - Suggested time slots
   - Integrated booking flow

By following this phased approach, you can deliver value incrementally while building toward the complete artist workflow experience.