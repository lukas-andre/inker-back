# Queues and Notifications System Documentation

## Overview

Inker backend uses a queue system based on Bull.js to handle asynchronous job processing, particularly for sending notifications. The system is organized into several modules that work together to process jobs and send notifications to users.

## Architecture

### 1. Queue Configuration

The system has multiple queues configured:
- `notification`: For handling notification-related jobs
- `deadLetter`: For handling failed jobs
- `sync`: For handling synchronization tasks

The queue configuration is defined in `/src/queues/queues.ts`.

### 2. Job Types and Schemas

Jobs are strongly typed using Zod schemas. Each job has:
- A unique job ID (like `EVENT_CREATED`, `EVENT_UPDATED`)
- Metadata specific to the job type
- A notification type ID

The schemas are defined in:
- `/src/queues/notifications/domain/schemas/agenda.ts`
- `/src/queues/notifications/domain/schemas/quotation.ts` 
- `/src/queues/notifications/domain/schemas/job.ts` (combines all schemas)

### 3. Job Registry and Factory

The system uses a registry pattern to manage different job types:
- `NotificationJobRegistry`: Maps job IDs to their handler classes
- `JobHandlerFactory`: Creates job handler instances
- `JobTypeSchemaRegistry`: Maps job IDs to their Zod schemas for validation

### 4. Notification Processor

The `NotificationProcessor` is a Bull processor that:
1. Validates incoming jobs against their schemas
2. Uses the factory to create appropriate job handlers
3. Executes the job handlers
4. Handles failures and moves failed jobs to the dead letter queue

### 5. Job Handlers

Each job type has a corresponding handler class that implements the `NotificationJob` interface:
- They all implement a `handle` method that accepts the job data
- They typically fetch additional data from the database
- They use notification services to send emails or push notifications

### 6. Notification Services

Two main services handle actual notification delivery:
- `EmailNotificationService`: Uses SendGrid to send emails
- `PushNotificationService`: Uses Firebase Cloud Messaging for push notifications

## How to Create a New Job Type

To create a new notification job type, you need to:

1. Define a new job schema in the appropriate schema file
2. Add the schema to the `JobTypeSchemaRegistry`
3. Create a job handler class that implements `NotificationJob`
4. Register the job handler in the `NotificationJobRegistry`

## Example Flow

When an agenda event status changes:

1. The usecase adds a job to the queue: `notificationsQueue.add('jobId', jobData)`
2. The `NotificationProcessor` picks up the job
3. The processor validates the job data using the schema
4. The `JobHandlerFactory` creates an instance of the appropriate handler
5. The handler fetches additional data and sends notifications
6. If the job fails, it's moved to the dead letter queue after multiple retries

## Important Notes

1. All jobs are validated against schemas before processing
2. Failed jobs are retried based on the queue configuration
3. After maximum retry attempts, jobs are moved to the dead letter queue
4. Job handlers should be designed to be idempotent
5. Notification templates are managed by the `TemplateService`