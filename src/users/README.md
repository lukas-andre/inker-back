# Users Module

## Overview
The Users module is responsible for managing all user-related functionality in the application, including authentication, authorization, user management, roles, and permissions. It follows clean architecture principles to ensure separation of concerns and maintainability.

## Architecture

This module follows a clean architecture pattern with three primary layers:

### Domain Layer
Contains the core business logic, entities, and business rules:
- User domain models
- Role and Permission models
- Domain exceptions and error codes
- Value objects
- Enumerations (UserType)

### Use Cases Layer
Contains the application-specific business rules and operations:
- User management (create, update, delete)
- Role and permission management
- User verification
- Password management
- User settings management

### Infrastructure Layer
Contains the implementation details and external interfaces:
- Repository implementations (database access)
- HTTP controllers
- DTOs for data transformation
- Entities for ORM
- Handlers for business logic orchestration

## Capabilities

### User Management
- User registration with different user types
- Profile management (username, email, password updates)
- Account verification via SMS and email
- Password reset functionality
- Account deletion (soft delete)
- User settings management

### Authentication
- Login with email or username
- Password hashing and verification
- SMS and email verification codes

### Authorization
- Role-based access control
- Permission-based access control
- Dynamic role and permission management

### User Settings
- Notification preferences
- Location services settings
- Application preferences

## Entities

### User
The central entity representing a user in the system:
- UUID identifier
- Username
- Email
- Password (hashed)
- User type (ARTIST, CUSTOMER, etc.)
- Role relationship
- Active status
- Phone number
- Timestamps (created, updated, deleted)

### Role
Represents a role that can be assigned to users:
- UUID identifier
- Name
- Description
- Permissions (many-to-many)

### Permission
Represents an action that can be performed:
- UUID identifier
- Controller (resource)
- Action (operation)

### VerificationHash
Used for verifying user accounts and resetting passwords:
- UUID identifier
- Hash value
- Type (verification, password reset)
- Expiration time
- User reference

### Settings
User-specific application settings:
- UUID identifier
- User reference
- Notification settings
- Location services settings
- Other preferences

## Use Cases

### User
- Create user by type
- Update user information (username, email, password)
- Delete user account
- Send verification codes (SMS, email)
- Validate verification codes
- Password reset

### Role
- Initialize roles
- Find all roles
- Find specific role

### Permission
- Initialize permissions
- Find all permissions
- Find specific permission

### Settings
- Get user settings
- Update notification settings
- Update location services settings

## Relationships with Other Modules

The Users module serves as a core module that interacts with several other modules:

- **Auth Module**: For authentication and authorization
- **Customers Module**: For customer-specific operations
- **Artists Module**: For artist-specific operations
- **Locations Module**: For location-based services
- **Agenda Module**: For scheduling and appointments
- **Notifications Module**: For sending notifications to users

## Technical Considerations

- UUID identifiers for better security and distributed systems
- TypeORM for database operations
- Repository pattern for data access
- Clean separation of concerns following SOLID principles
- Comprehensive error handling
- Proper validation using DTOs

## API Endpoints

The Users module exposes several API endpoints:

- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/verify` - Verify user account
- `POST /users/password/forgot` - Request password reset
- `POST /users/password/reset` - Reset password
- `GET /roles` - Get all roles
- `GET /permissions` - Get all permissions
- `GET /settings` - Get user settings
- `PATCH /settings` - Update user settings

## Events

The Users module emits and listens to several events:

- `user.created` - When a new user is created
- `user.updated` - When a user is updated
- `user.deleted` - When a user is deleted
- `user.verified` - When a user is verified
- `password.reset` - When a password is reset 