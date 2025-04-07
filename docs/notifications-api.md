# Notifications API Documentation

This document describes the API endpoints for accessing and managing user notifications in the Inker application.

## Overview

The Notifications API allows users to:

- Retrieve their notifications with pagination
- Mark individual notifications as read
- Mark all notifications as read at once
- Delete notifications

All endpoints require authentication via a bearer token.

## API Endpoints

### Get Notifications

Retrieves a paginated list of notifications for the current user.

**Endpoint:** `GET /notifications`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `type` (optional): Filter by notification type (e.g., EVENT_STATUS_CHANGED)

**Response:**
```json
{
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
      "title": "Your appointment status has changed",
      "body": "Your appointment has been confirmed",
      "type": "EVENT_STATUS_CHANGED",
      "data": {
        "eventId": 123,
        "status": "confirmed",
        "artistId": 456
      },
      "read": false,
      "createdAt": "2023-01-01T12:00:00Z"
    },
    // More notifications...
  ],
  "page": 1,
  "limit": 10,
  "total": 50,
  "pages": 5,
  "unreadCount": 8
}
```

### Mark Notification as Read

Marks a specific notification as read.

**Endpoint:** `PATCH /notifications/{id}/read`

**Path Parameters:**
- `id`: The UUID of the notification to mark as read

**Response:** 204 No Content

### Mark All Notifications as Read

Marks all notifications for the current user as read.

**Endpoint:** `PATCH /notifications/read-all`

**Response:** 204 No Content

### Delete Notification

Permanently removes a notification.

**Endpoint:** `DELETE /notifications/{id}`

**Path Parameters:**
- `id`: The UUID of the notification to delete

**Response:** 204 No Content

## Notification Types

The following notification types are supported:

- `EVENT_CREATED`: A new event has been created
- `EVENT_UPDATED`: An event has been updated
- `EVENT_CANCELED`: An event has been canceled
- `EVENT_STATUS_CHANGED`: An event's status has changed
- `EVENT_REMINDER`: Reminder for an upcoming event
- `RSVP_ACCEPTED`: An RSVP has been accepted
- `RSVP_DECLINED`: An RSVP has been declined
- `QUOTATION_CREATED`: A new quotation has been created
- `QUOTATION_REPLIED`: A quotation has been replied to
- `QUOTATION_ACCEPTED`: A quotation has been accepted
- `QUOTATION_REJECTED`: A quotation has been rejected
- `QUOTATION_APPEALED`: A quotation has been appealed
- `QUOTATION_CANCELED`: A quotation has been canceled

## Frontend Integration

### Example: Fetching Notifications

```typescript
// Example using fetch
async function getNotifications(page = 1, limit = 10) {
  const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  return await response.json();
}

// Example using axios
async function getNotifications(page = 1, limit = 10) {
  const response = await axios.get('/api/notifications', {
    params: { page, limit },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
}
```

### Example: Marking a Notification as Read

```typescript
async function markAsRead(notificationId) {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
}
```

### Example: Notification Badge Count

The `unreadCount` property in the response can be used to display a badge with the number of unread notifications:

```typescript
function NotificationBadge({ unreadCount }) {
  if (unreadCount === 0) {
    return null;
  }
  
  return (
    <div className="notification-badge">
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
}
```

## Best Practices

1. **Pagination**: Always use pagination when displaying notifications to improve performance.
2. **Auto-refresh**: Consider implementing a polling mechanism or WebSocket connection to auto-refresh notifications.
3. **Optimistic Updates**: When marking a notification as read, update the UI immediately before the server responds.
4. **Error Handling**: Implement proper error handling for failed API requests.
5. **Notification Groups**: Consider grouping similar notifications in the UI to improve user experience.