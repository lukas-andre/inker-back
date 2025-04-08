# Users Module - Technical Documentation

## Database Schema

### User Table
```sql
CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "username" varchar(100) NOT NULL,
  "email" varchar NOT NULL,
  "password" varchar NOT NULL,
  "user_type" varchar NOT NULL,
  "active" boolean NOT NULL DEFAULT false,
  "phone_number" varchar,
  "deleted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "roleId" uuid
);
```

### Role Table
```sql
CREATE TABLE "role" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar NOT NULL,
  "description" varchar,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
```

### Permission Table
```sql
CREATE TABLE "permission" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "controller" varchar NOT NULL,
  "action" varchar NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
```

### Role_Permission Table (Junction)
```sql
CREATE TABLE "role_permission" (
  "roleId" uuid NOT NULL,
  "permissionId" uuid NOT NULL,
  PRIMARY KEY ("roleId", "permissionId")
);
```

### Verification_Hash Table
```sql
CREATE TABLE "verification_hash" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "hash" varchar NOT NULL,
  "type" varchar NOT NULL,
  "expires_at" timestamp NOT NULL,
  "userId" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
```

### Settings Table
```sql
CREATE TABLE "settings" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "notifications" jsonb NOT NULL DEFAULT '{}',
  "location_services" boolean NOT NULL DEFAULT false,
  "userId" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
```

## Repository Layer

The repository layer follows the Repository pattern and provides data access abstraction. It contains the following repositories:

### UsersRepository
Handles database operations for the User entity:
- Finding users by ID, email, username
- Checking existence
- Creating and updating users
- Soft deletion
- Password hashing and validation

### RolesRepository
Handles database operations for the Role entity:
- Finding roles
- Creating roles
- Assigning permissions to roles

### PermissionsRepository
Handles database operations for the Permission entity:
- Finding permissions
- Creating permissions

### VerificationHashRepository
Handles database operations for the VerificationHash entity:
- Creating verification hashes
- Validating verification codes
- Cleaning expired verification codes

### SettingsRepository
Handles database operations for the Settings entity:
- Finding settings by user ID
- Creating and updating settings

## Use Case Layer

The use case layer contains the business logic and orchestrates the repositories. Each use case is implemented as a separate class following the Single Responsibility Principle.

### User Use Cases:
- `CreateUserByTypeUseCase` - Creates a user of a specific type
- `DeleteUserUseCase` - Soft deletes a user
- `SendSMSAccountVerificationCodeUseCase` - Sends verification code via SMS
- `SendEmailVerificationCodeUseCase` - Sends verification code via email
- `ValidateSMSAccountVerificationCodeUseCase` - Validates SMS verification code
- `UpdateUserEmailUseCase` - Updates user email
- `UpdateUserPasswordUseCase` - Updates user password
- `UpdateUserUsernameUseCase` - Updates username
- `SendForgotPasswordCodeUseCase` - Sends password reset code
- `UpdateUserPasswordWithCodeUseCase` - Resets password with code

### Role Use Cases:
- `InitRolesUseCase` - Initializes default roles
- `FindAllRolesUseCase` - Finds all roles
- `FindOneRoleUseCase` - Finds a specific role

### Permission Use Cases:
- `InitPermissionsUseCase` - Initializes default permissions
- `FindAllPermissionsUseCase` - Finds all permissions
- `FindOnePermissionUseCase` - Finds a specific permission
- `FindAllRoutesUseCase` - Finds all available routes/endpoints

### Settings Use Cases:
- `GetSettingsUseCase` - Gets user settings
- `UpdateNotificationsUseCase` - Updates notification settings
- `UpdateLocationServicesUseCase` - Updates location services settings

## Infrastructure Layer Handlers

The handlers act as orchestrators between controllers and use cases:

### UsersHandler
- Orchestrates user-related use cases
- Handles user creation, updates, and deletion
- Manages user verification and password reset

### RolesHandler
- Orchestrates role-related use cases
- Handles role initialization and retrieval

### PermissionsHandler
- Orchestrates permission-related use cases
- Handles permission initialization and retrieval

### SettingsHandler
- Orchestrates settings-related use cases
- Handles settings retrieval and updates

## Controllers and API Endpoints

### UsersController
- `POST /users` - Create a new user
- `GET /users/:id` - Get a user by ID
- `PATCH /users/:id/username` - Update username
- `PATCH /users/:id/email` - Update email
- `PATCH /users/:id/password` - Update password
- `DELETE /users/:id` - Delete a user
- `POST /users/verification-code/sms` - Send SMS verification code
- `POST /users/verification-code/email` - Send email verification code
- `POST /users/verification-code/validate` - Validate verification code
- `POST /users/password/forgot` - Request password reset
- `POST /users/password/reset` - Reset password

### RolesController
- `GET /roles` - Get all roles
- `GET /roles/:id` - Get a role by ID

### PermissionsController
- `GET /permissions` - Get all permissions
- `GET /permissions/routes` - Get all routes/endpoints
- `GET /permissions/:id` - Get a permission by ID

### SettingsController
- `GET /settings` - Get user settings
- `PATCH /settings/notifications` - Update notification settings
- `PATCH /settings/location-services` - Update location services settings

## DTOs (Data Transfer Objects)

### Request DTOs
- `CreateUserDto` - For user creation
- `UpdateUsernameDto` - For username updates
- `UpdateEmailDto` - For email updates
- `UpdatePasswordDto` - For password updates
- `SendVerificationCodeDto` - For sending verification codes
- `ValidateVerificationCodeDto` - For validating verification codes
- `ForgotPasswordDto` - For requesting password reset
- `ResetPasswordDto` - For resetting password
- `UpdateNotificationsDto` - For updating notification settings
- `UpdateLocationServicesDto` - For updating location services settings

### Response DTOs
- `UserDto` - For user data
- `RoleDto` - For role data
- `PermissionDto` - For permission data
- `SettingsDto` - For settings data

## Error Handling

The module implements comprehensive error handling using domain-specific exceptions:

- `USER_ALREADY_EXISTS` - When attempting to create a user with existing email/username
- `USER_NOT_FOUND` - When user is not found
- `INVALID_VERIFICATION_CODE` - When verification code is invalid
- `VERIFICATION_CODE_EXPIRED` - When verification code has expired
- `ERROR_ACTIVATING_USER` - When there's an error activating a user
- `INVALID_PASSWORD` - When password is invalid
- `ROLE_NOT_FOUND` - When role is not found
- `PERMISSION_NOT_FOUND` - When permission is not found

## Migration Guide: Integer to UUID IDs

To migrate from integer IDs to UUIDs:

1. Update the BaseEntity class to use UUIDs
2. Create a migration to:
   - Add UUID columns to all tables
   - Generate UUIDs for existing records
   - Update foreign key references
   - Drop the integer ID columns

3. Update repository methods to use string IDs instead of numbers
4. Update all queries to work with UUID columns

Example migration SQL:
```sql
-- Add UUID columns
ALTER TABLE "user" ADD COLUMN "uuid_id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "role" ADD COLUMN "uuid_id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "permission" ADD COLUMN "uuid_id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "verification_hash" ADD COLUMN "uuid_id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "settings" ADD COLUMN "uuid_id" uuid DEFAULT uuid_generate_v4();

-- Update foreign key references
UPDATE "user" SET "roleId_uuid" = r.uuid_id FROM "role" r WHERE "user"."roleId" = r.id;
UPDATE "role_permission" SET "roleId_uuid" = r.uuid_id FROM "role" r WHERE "role_permission"."roleId" = r.id;
UPDATE "role_permission" SET "permissionId_uuid" = p.uuid_id FROM "permission" p WHERE "role_permission"."permissionId" = p.id;
UPDATE "verification_hash" SET "userId_uuid" = u.uuid_id FROM "user" u WHERE "verification_hash"."userId" = u.id;
UPDATE "settings" SET "userId_uuid" = u.uuid_id FROM "user" u WHERE "settings"."userId" = u.id;

-- Make UUID columns primary keys
ALTER TABLE "user" DROP CONSTRAINT "PK_user";
ALTER TABLE "role" DROP CONSTRAINT "PK_role";
ALTER TABLE "permission" DROP CONSTRAINT "PK_permission";
ALTER TABLE "verification_hash" DROP CONSTRAINT "PK_verification_hash";
ALTER TABLE "settings" DROP CONSTRAINT "PK_settings";

ALTER TABLE "user" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "role" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "permission" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "verification_hash" RENAME COLUMN "uuid_id" TO "id";
ALTER TABLE "settings" RENAME COLUMN "uuid_id" TO "id";

ALTER TABLE "user" ADD PRIMARY KEY ("id");
ALTER TABLE "role" ADD PRIMARY KEY ("id");
ALTER TABLE "permission" ADD PRIMARY KEY ("id");
ALTER TABLE "verification_hash" ADD PRIMARY KEY ("id");
ALTER TABLE "settings" ADD PRIMARY KEY ("id");
```

## Testing Strategy

The Users module is tested at multiple levels:

### Unit Tests
- Test individual use cases with mocked repositories
- Test repositories with in-memory database
- Test validation logic

### Integration Tests
- Test repositories with real database
- Test use cases with real repositories
- Test handlers with real use cases

### End-to-End Tests
- Test API endpoints
- Test authentication and authorization
- Test user flows (registration, verification, password reset)

## Performance Considerations

- Indexes on frequently queried columns (email, username, phone_number)
- Proper pagination for listing endpoints
- Optimized queries using TypeORM features
- Proper error handling and logging 