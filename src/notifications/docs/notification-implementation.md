# Notification Implementation Guide

This guide explains how the notification system works in the Inker application and how to implement new notifications.

## Overview

The notification system consists of three components:

1. **Notification Jobs**: Process and send notifications
2. **Notification Storage**: Stores notifications in the database
3. **Notification API**: Allows frontend to retrieve notifications

## How Notifications Are Created

Notifications are created when events occur in the system. The process is as follows:

1. A use case (e.g., `ChangeEventStatusUsecase`) adds a job to the notification queue
2. The job is picked up by the `NotificationProcessor`
3. The appropriate job handler is created and processes the job
4. The job handler:
   - Stores the notification in the database using `NotificationStorageService`
   - Sends email notifications using `EmailNotificationService`
   - Sends push notifications using `PushNotificationService`

## Implementing a New Notification Type

To implement a new notification type, follow these steps:

### 1. Add the job schema

Add the job type to the appropriate schema file (e.g., `agenda.ts`).

```typescript
const NewNotificationJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.NEW_NOTIFICATION_TYPE),
  metadata: z.object({
    userId: z.number(),
    // Add any other required metadata
  }),
});
export type NewNotificationJobType = z.infer<typeof NewNotificationJobSchema>;
```

### 2. Update the job registry

Add the new job type to the appropriate registry files:

```typescript
// In domain/jobSchema.registry.ts
export const JobTypeSchemaRegistry = {
  // ... existing types
  NEW_NOTIFICATION_TYPE: NewNotificationJobSchema,
};

// In job.registry.ts
constructor() {
  // ... existing mappings
  this.jobMap.set('NEW_NOTIFICATION_TYPE', NewNotificationJobHandler);
}
```

### 3. Create the job handler

Create a new job handler class that extends `NotificationJob`:

```typescript
export class NewNotificationJobHandler extends NotificationJob {
  constructor(
    emailNotificationService: EmailNotificationService,
    agendaEventProvider: AgendaEventProvider,
    artistProvider: ArtistProvider,
    customerProvider: CustomerProvider,
    locationProvider: ArtistLocationProvider,
    quotationProvider: QuotationProvider,
    pushNotificationService: PushNotificationService,
    notificationStorageService: NotificationStorageService,
  ) {
    super(
      emailNotificationService,
      agendaEventProvider,
      artistProvider,
      customerProvider,
      locationProvider,
      quotationProvider,
      pushNotificationService,
      notificationStorageService
    );
  }

  async handle(job: NewNotificationJobType): Promise<void> {
    const { userId, /* other metadata */ } = job.metadata;

    // 1. Store notification in database
    await this.notificationStorageService.storeNotification(
      userId,
      'Notification Title',
      'Notification Message',
      'NEW_NOTIFICATION_TYPE',
      { /* Additional data */ }
    );

    // 2. Send email notification if needed
    // 3. Send push notification if needed
  }
}
```

### 4. Update the email templates (if using email)

If your notification sends emails, add the email type to the `email.ts` schema:

```typescript
export const MailIdSchema = z.enum([
  // ... existing types
  'NEW_NOTIFICATION_TYPE',
]);

const NewNotificationTypeSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.NEW_NOTIFICATION_TYPE),
  // Add any other required fields
});
export type NewNotificationTypeSchema = z.infer<typeof NewNotificationTypeSchema>;
```

### 5. Create the email template (if using email)

Create a new Handlebars template in `templates/newNotificationType.hbs`:

```html
<!DOCTYPE html>
<html lang="en">
{{> head}}
<body>
    {{> header message="Your notification message!"}}
    
    <!-- Main Content -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff;">
        <!-- Your email content -->
    </table>
    
    {{> footer}}
</body>
</html>
```

### 6. Update the template registry (if using email)

```typescript
export const TemplateRegistry: Record<
  MailIdType,
  { schema: Zod.AnyZodObject; path: string; subject: string }
> = {
  // ... existing entries
  NEW_NOTIFICATION_TYPE: {
    schema: NewNotificationTypeSchema,
    path: path.join(__dirname, './newNotificationType.hbs'),
    subject: 'Your New Notification',
  },
};
```

## Best Practices

1. **Store notifications for all relevant users**: If a notification is relevant to multiple users (e.g., both artist and customer), store it for each user.

2. **Include enough data in the notification**: The data field should include all information needed to render the notification and link to the relevant page.

3. **Use consistent titles and messages**: Format titles and messages consistently across all notification types.

4. **Handle errors gracefully**: Always catch errors in notification sending to prevent job failures.

5. **Test all notification types**: Ensure all notification types work as expected, including database storage, emails, and push notifications.

## Example Implementation

Here's an example of the `AgendaEventStatusChangedJob` implementation that demonstrates these practices:

```typescript
async handle(job: AgendaEventStatusChangedJobType): Promise<void> {
  const { artistId, customerId, eventId, status, message } = job.metadata;

  // Fetch necessary data
  const [event, artist, customer] = await Promise.all([
    this.agendaEventProvider.findById(eventId),
    this.artistProvider.findById(artistId),
    this.customerProvider.findById(customerId),
  ]);

  if (!event || !artist || !customer) {
    console.error(`Missing data for event status changed notification`);
    return;
  }

  // Build notification title and message
  const title = `Appointment Status: ${this.getStatusDisplayName(status)}`;
  const notificationMessage = message || `Your appointment status is now ${this.getStatusDisplayName(status)}`;
  
  // Store notification for customer in database
  await this.notificationStorageService.storeNotification(
    customerId,
    title,
    notificationMessage,
    'EVENT_STATUS_CHANGED',
    { eventId, artistId, status },
  );

  // Store notification for artist in database
  await this.notificationStorageService.storeNotification(
    artistId,
    `Appointment Status Updated`,
    `Appointment with ${customer.firstName} is now ${this.getStatusDisplayName(status)}`,
    'EVENT_STATUS_CHANGED',
    { eventId, customerId, status },
  );

  // Send email and push notifications
  // ...
}
```