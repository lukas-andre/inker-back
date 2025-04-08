# Inker Technical Documentation

## Architecture Overview

Inker is built as a modern, scalable backend service following Clean Architecture principles. The application is structured around distinct, domain-focused modules that encapsulate specific business capabilities.

### Key Architectural Patterns

- **Clean Architecture**: Clear separation between domain logic, application use cases, and infrastructure
- **Dependency Injection**: Leveraging NestJS's powerful DI container for loose coupling
- **Repository Pattern**: Abstracting data access behind repositories for flexibility in data sources
- **CQRS-inspired**: Separating commands and queries for better scalability and performance
- **Event-Driven**: Using events for cross-module communication when appropriate

### Technology Stack

- **Framework**: NestJS v9
- **HTTP Provider**: Fastify (higher performance than Express)
- **Database**: PostgreSQL with TypeORM
- **Real-time**: WebSocket functionality via Socket.io
- **Queue Management**: Bull for job processing and scheduling
- **Cloud Integration**: AWS services
- **Notifications**: Firebase Admin for push notifications
- **Testing**: Jest for comprehensive testing

## Core Components

### 1. Users Module

The Users module manages all user-related functionality including authentication, authorization, and profile management.

**Key Features**:
- User creation and management
- Role-based access control
- Permission management
- Account verification
- Password management
- User settings

**Domain Entities**:
- User
- Role
- Permission
- VerificationHash
- Settings

### 2. Artists Module

The Artists module handles all functionality related to tattoo artists using the platform.

**Key Features**:
- Artist profile management
- Portfolio management
- Availability tracking
- Skills and specializations
- Ratings and reviews

**Domain Entities**:
- Artist (extends User)
- Portfolio
- Availability
- Specialization

### 3. Customers Module

The Customers module manages all customer-related functionality.

**Key Features**:
- Customer profile management
- Appointment history
- Preferences
- Favorite artists

**Domain Entities**:
- Customer (extends User)
- Preference
- FavoriteArtist

### 4. Agenda Module

The Agenda module handles scheduling and appointment management.

**Key Features**:
- Appointment creation and management
- Availability management
- Calendar synchronization
- Booking confirmations
- Rescheduling and cancellations

**Domain Entities**:
- Appointment
- TimeSlot
- Availability
- BookingRequest

### 5. Tags Module

The Tags module provides categorization functionality across the application.

**Key Features**:
- Tag management
- Tagging functionality for various entities
- Tag-based search and filtering

**Domain Entities**:
- Tag
- TaggedItem

### 6. Schedulers Module

The Schedulers module manages recurring tasks and notifications.

**Key Features**:
- Appointment reminders
- Follow-up notifications
- System maintenance tasks
- Scheduled reports

**Domain Entities**:
- ScheduledTask
- Reminder
- NotificationTemplate

## Component Relationships

### User Interactions

- **Users → Artists**: Artists are specialized users with extended profiles
- **Users → Customers**: Customers are specialized users with customer-specific data
- **Users → Agenda**: Users (both artists and customers) interact with the Agenda for appointments

### Appointment Flow

1. **Customer** selects an **Artist** based on portfolio and availability
2. **Customer** books an appointment through the **Agenda** module
3. **Artist** receives notification and confirms/rejects
4. **Scheduler** sends reminders before the appointment
5. After appointment, **Customer** can leave reviews on the **Artist** profile

### Data Tagging Process

1. **Artists** tag their work with specific **Tags**
2. **Customers** can search for artists using **Tags**
3. **Tags** provide categorization for portfolios and search functionality

## Technical Considerations

### Database Strategy

The application uses TypeORM with a clear entity separation by module. UUID migration from incremental IDs improves security and scalability.

### Repository Pattern Implementation

All data access is abstracted through repositories, allowing:
- Easier testing through mocking
- Potential data source changes with minimal impact
- Cleaner business logic with data access concerns separated

### API Design

- RESTful endpoints organized by domain
- Consistent DTO pattern for request/response data
- Swagger documentation for all endpoints
- Proper validation using class-validator

### Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Granular permissions system
- Security best practices implemented

### Performance Considerations

- Proper indexing for database tables
- Pagination for large result sets
- Optimized queries for high-traffic operations
- Caching strategies for read-heavy operations

### Scalability Approach

- Modular design allowing for horizontal scaling
- Stateless API design
- Queue-based processing for heavy operations
- Database connection pooling and optimization

## Areas for Improvement

### Technical Debt

- Complete migration from incremental IDs to UUIDs across all entities
- Standardize naming conventions (changing "providers" to "repositories" consistently)
- Improve test coverage, particularly for newer modules

### Feature Enhancements

- Implement more robust caching strategy
- Add better logging and monitoring
- Enhance error handling with more specific error types
- Improve WebSocket implementation for real-time features

### Architectural Improvements

- Consider microservices approach for further scalability
- Implement event sourcing for critical data flows
- Enhance CQRS implementation for better separation of concerns
- Add more comprehensive integration testing

## Deployment Considerations

- Environment-specific configuration management
- CI/CD pipeline setup
- Health checks and monitoring
- Backup and recovery strategy
- Scaling policies 