# Frontend Integration Guide: Customer Appointments View

This guide details the necessary changes to integrate the updated response structure for the customer appointments view.

## 1. Overview of Changes

The API response for the customer appointments view has been optimized to reduce data redundancy and improve performance. The key changes are:

1.  **`heroAppointment` Object Replaced with ID**: The `heroAppointment` object has been removed and replaced with `heroAppointmentId`, which is a string containing the ID of the event.
2.  **Removal of Redundant Data**: The `artist` and `location` objects are no longer included within the `quotation` object in each appointment, as they are already available at the top level.

## 2. Old vs. New Response Structure

### Old Structure

```json
{
  "heroAppointment": {
    "event": { ... },
    "artist": { ... },
    "location": { ... },
    "quotation": {
      ...
      "artist": { ... },
      "location": { ... }
    }
  },
  "appointments": {
    "requiringAction": [ ... ],
    "today": [ ... ],
    "thisWeek": [ ... ],
    "upcoming": [ ... ],
    "history": [ ... ]
  }
}
```

### New Structure

```json
{
  "heroAppointmentId": "a3f3bcc2-40e0-4e31-aa87-e5de73f02ef8",
  "appointments": {
    "requiringAction": [
      {
        "event": { ... },
        "artist": { ... },
        "location": { ... },
        "quotation": {
          ...
        }
      }
    ],
    "today": [ ... ],
    "thisWeek": [ ... ],
    "upcoming": [ ... ],
    "history": [ ... ]
  }
}
```

## 3. Frontend Code Adaptation

### Finding the Hero Appointment

To find the hero appointment, you will need to search for it in the `appointments` lists using the `heroAppointmentId`.

Here is an example of how you can find the hero appointment:

```typescript
function findHeroAppointment(response, heroAppointmentId) {
  if (!heroAppointmentId) {
    return null;
  }

  for (const group of Object.values(response.appointments)) {
    const hero = group.find(appointment => appointment.event.id === heroAppointmentId);
    if (hero) {
      return hero;
    }
  }

  return null;
}

// Usage
const heroAppointment = findHeroAppointment(response, response.heroAppointmentId);
```

### Accessing Artist and Location Data

When you need to access artist or location data for an appointment, use the top-level `artist` and `location` objects instead of looking for them inside the `quotation` object.

```typescript
// Correct way to access artist and location data
const artistName = appointment.artist.firstName;
const locationAddress = appointment.location.formattedAddress;

// Incorrect way (this will no longer work)
// const artistName = appointment.quotation.artist.firstName; 
// const locationAddress = appointment.quotation.location.formattedAddress;
```

These changes will make your frontend code cleaner and more efficient by reducing the amount of data that needs to be processed. If you have any questions, please don't hesitate to ask. 