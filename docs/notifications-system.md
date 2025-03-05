# Notifications System Documentation

This document describes how the notifications system works in the Inker backend, including email notifications, push notifications, and the queuing system that powers them.

## System Overview

The Inker notification system consists of three main components:

1. **Queue System**: Handles asynchronous processing of notification jobs
2. **Email Notifications**: Sends formatted emails using templates
3. **Push Notifications**: Sends push notifications to mobile devices

## Queue System

The queue system uses Bull.js (Redis-based queue) to handle notification jobs asynchronously.

### Key Components:

- **NotificationQueueModule**: The main module that configures the queues
- **NotificationProcessor**: Processes jobs from the notification queue
- **JobHandlerFactory**: Creates handlers for different job types
- **NotificationJobRegistry**: Maps job IDs to handler classes

### Job Processing Flow:

1. A use case adds a job to the queue with `notificationsQueue.add({ jobId, metadata })`
2. The notification processor picks up the job and validates it against its schema
3. The job handler factory creates the appropriate handler for the job type
4. The handler processes the job, typically by sending notifications

## Email Notifications

Emails are sent using SendGrid and rendered using Handlebars templates.

### Key Components:

- **EmailNotificationService**: Main service for sending emails
- **TemplateService**: Compiles templates and handles context
- **TemplateRegistry**: Maps email types to templates and subjects

### Email Types and Schemas:

Each email type has:
- A defined schema in `email.ts`
- A template file in `templates/`
- An entry in the `TemplateRegistry`

For example, the `EVENT_STATUS_CHANGED` email type has:
- Schema: `AgendaEventStatusChangedSchema`
- Template: `agendaEventStatusChanged.hbs`
- Registry entry with path and subject

### Adding a New Email Type:

1. Add the mail ID to `MailIdSchema` enum
2. Create a schema extending `BaseEmailSchema`
3. Create an HBS template in the templates directory
4. Add the template to the `TemplateRegistry`
5. Export the schema and add it to the union type

### Template Helpers:

The system includes several Handlebars helpers:
- `formatDate`: Formats a date with a specified format
- `formatDateCustom`: Formats a date in a standardized way
- `formatStatus`: Displays event status in a user-friendly way
- `eq`: Checks if two values are equal

## Push Notifications

Push notifications are sent using Firebase Cloud Messaging (FCM).

### Key Components:

- **PushNotificationService**: Sends push notifications via FCM
- **NotificationRepository**: Manages FCM tokens
- **FCMPayloadUtil**: Helper for preparing FCM payloads

### Push Notification Flow:

1. Users register their device FCM tokens in the app
2. Tokens are stored with user ID, device type, and status
3. When sending notifications, the system fetches tokens for the user
4. Notifications are sent to all active tokens for that user
5. Invalid tokens are automatically marked as inactive

### Notification Structure:

```javascript
{
  title: "Notification Title",
  body: "Notification content",
  data: {
    // Optional metadata for the app
    eventId: 123,
    status: "in_progress"
  }
}
```

## Example: Event Status Changed Notification

When an event's status changes:

1. The `ChangeEventStatusUsecase` adds a job to the notification queue:
```javascript
await this.notificationsQueue.add({
  jobId: 'EVENT_STATUS_CHANGED',
  notificationTypeId: 'EMAIL',
  metadata: {
    eventId,
    customerId,
    artistId,
    status,
    message,
  }
});
```

2. The `AgendaEventStatusChangedJob` handles the job:
   - Fetches event, artist, and customer data
   - Sends an email using the `EmailNotificationService`
   - Sends a push notification using the `PushNotificationService`

3. The email is formatted using the `agendaEventStatusChanged.hbs` template
   - The status is formatted using the `formatStatus` helper
   - The date is formatted using the `formatDateCustom` helper

4. The push notification includes:
   - Title with formatted status
   - Message body
   - Data payload with event ID and status

## Best Practices

1. **Use Job Types**: Always use predefined job types rather than arbitrary strings
2. **Validate Schemas**: Ensure all notification data matches defined schemas
3. **Handle Failures**: Handle notification failures gracefully
4. **Localization**: Use locale-specific formatting for dates and messages
5. **Provide Context**: Include enough context in notifications for users to understand
6. **Test Templates**: Test all templates with various data combinations