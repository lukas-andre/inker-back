# Inker Backend: Module Creation Guide

## 1. Introduction

This guide provides a comprehensive overview of how to create new feature modules within the Inker backend system. It details the project's architecture, best practices, and specific patterns for database management, notifications, queues, and more. Adhering to these guidelines will ensure consistency, maintainability, and scalability of the application.

The Inker backend is built with:
- **NestJS v9**: A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **Fastify**: Used as the HTTP provider for enhanced performance over Express.
- **TypeORM**: For database interactions, supporting a multi-database architecture.
- **Clean Architecture**: Promoting separation of concerns and modularity.
- **TypeScript**: For static typing and improved developer experience.

## 2. Core Architectural Principles

The application adheres to Clean Architecture principles, ensuring a clear separation between different layers of the software. For a detailed explanation of the general flow, refer to `docs/core/Arquitectura del proyecto.md`.

**Key Layers:**

1.  **Controllers (`infrastructure/controllers`)**: Entry point for HTTP requests, responsible for initial validation (via DTOs and pipes) and delegation to Handlers or Use Cases.
2.  **Handlers (`infrastructure/handlers`)**: Optional intermediary layer for complex request transformation or orchestration of multiple use cases.
3.  **Use Cases (`usecases`)**: Encapsulate application-specific business rules. They are independent of delivery mechanisms and depend on abstractions (interfaces) for infrastructure concerns.
4.  **Providers (Repositories in `infrastructure/repositories`, Services in `services` or imported modules)**: Concrete implementations for infrastructure concerns like database interaction (Repositories using TypeORM), external service communication, etc.
5.  **Domain Layer (`domain`)**: The core of the module, containing business logic, entities, value objects, domain events, and custom errors, independent of infrastructure.

**Guiding Principles:**
*   **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
*   **Dependency Injection (DI)**: Leveraged throughout the application by NestJS.
*   **Modularity**: Features are organized into self-contained modules.
*   **Separation of Concerns**: Each layer and component has a distinct responsibility.

## 3. Anatomy of a Feature Module

A typical feature module (e.g., `src/artists/`) is structured as follows:

*   **`domain/`**:
    *   `dtos/`: Data Transfer Objects primarily for domain logic.
    *   `entities/` or `models/`: Core domain entities/models (conceptual, may differ from DB schema).
    *   `enums/`: Domain-specific enumerations.
    *   `errors/`: Custom domain exceptions.
    *   `events/`: Domain events.
    *   `interfaces/`: Abstractions for repositories or domain services.
    *   `services/`: Domain-specific business logic that doesn't fit in a single entity.
*   **`infrastructure/`**:
    *   `controllers/`: HTTP controllers.
    *   `database/` (if specific DB structures/migrations for this module, otherwise entities go here)
        *   `entities/`: TypeORM entities representing database tables.
        *   `repositories/`: Concrete repository implementations.
    *   `dtos/`: DTOs for controller request/response shaping and validation.
    *   `entities/`: TypeORM entities (can also be structured under `database/entities/`).
    *   `handlers/`: Request handlers (optional).
    *   `pipes/`: Custom validation pipes.
    *   `repositories/`: Concrete repository implementations (often part of a separate `RepositoryModule`).
    *   `services/`: Infrastructure-specific services.
*   **`usecases/`**:
    *   Contains classes that orchestrate the flow of data and interactions between domain entities and infrastructure services for specific application tasks (e.g., `createArtist.usecase.ts`).
*   **`module.ts` (e.g., `artists.module.ts`)**: The NestJS module definition file that ties together controllers, providers (use cases, services, handlers), and imports necessary external or repository modules.

**Key Distinction: Feature Modules vs. Repository Modules**

*   **Feature Module (e.g., `src/artists/artists.module.ts`)**: Encapsulates the functionality of a specific domain or feature. It imports controllers, use cases, and other necessary providers. It will *import* Repository Modules to get access to data persistence logic.
*   **Repository Module (e.g., `src/artists/infrastructure/repositories/artistRepository.module.ts`)**: Specifically manages the TypeORM setup for a particular set of entities and a database connection. It imports `TypeOrmModule.forFeature([Entity1, Entity2], 'database-connection-name')` and exports the repository providers. This promotes reusability and clear separation of data access logic, crucial for the multi-DB strategy.

## 4. Creating a New Feature Module: Step-by-Step

Let's assume we are creating a new module called `NewFeature`.

### Step 1: Define the Domain (`src/newfeature/domain/`)

1.  **Entities/Models**: Define the core business objects (e.g., `NewFeatureEntity`). These are plain classes or interfaces representing concepts.
2.  **Value Objects**: Define immutable objects representing descriptive aspects of the domain.
3.  **DTOs**: Create DTOs for internal domain operations if needed.
4.  **Enums**: Define relevant enumerations.
5.  **Custom Errors**: Create specific error classes for business rule violations (e.g., `NewFeatureNotFoundError.ts`).
6.  **Interfaces for Repositories**: Define interfaces for how use cases will interact with data persistence (e.g., `INewFeatureRepository.ts`). These interfaces will be implemented by concrete repositories in the infrastructure layer.
    ```typescript
    // src/newfeature/domain/interfaces/newFeatureRepository.interface.ts
    export interface INewFeatureRepository {
      findById(id: string): Promise<NewFeatureEntity | null>;
      save(entity: NewFeatureEntity): Promise<NewFeatureEntity>;
      // ... other methods
    }
    ```
7.  **Domain Services**: Implement business logic that doesn't belong to a single entity.

### Step 2: Implement Infrastructure (`src/newfeature/infrastructure/`)

1.  **Database Setup (If introducing a new database connection)**:
    *   **Configuration**:
        *   Add a new configuration file in `src/config/database/` (e.g., `newfeature.config.ts`).
            ```typescript
            // src/config/database/newfeature.config.ts
            import { registerAs } from '@nestjs/config';
            import Joi from 'joi';

            export const newFeatureDbConfig = registerAs('newfeature-db', () => ({
              // ... connection details from process.env ...
            }));

            export const newFeatureDbConfigSchema = Joi.object({
              // ... Joi schema for env vars ...
            });
            ```
        *   Update `src/config/database/config.ts` to include the schema and load the config.
        *   Update `src/config/config.ts` to aggregate this new database config.
    *   **Constants**: Add a new database connection name in `src/databases/constants.ts`.
        ```typescript
        // src/databases/constants.ts
        export const NEWFEATURE_DB_CONNECTION_NAME = 'newfeature-db';
        ```
    *   **Database Module**: Update `src/databases/database.module.ts` to register the new TypeORM connection using the config and connection name.
        ```typescript
        // src/databases/database.module.ts
        // ... imports ...
        import { newFeatureDbConfig } from '../config/database/newfeature.config';
        import { NEWFEATURE_DB_CONNECTION_NAME } from './constants';

        // ...
        TypeOrmModule.forRootAsync({
          name: NEWFEATURE_DB_CONNECTION_NAME,
          inject: [newFeatureDbConfig.KEY],
          useFactory: (config: ConfigType<typeof newFeatureDbConfig>) => ({
            type: 'postgres', // or your DB type
            // ... other connection options from config ...
            entities: [/* path to NewFeature TypeORM entities */],
            synchronize: false, // recommend false for prod, use migrations
          }),
        }),
        // ...
        ```

2.  **TypeORM Entities (`src/newfeature/infrastructure/entities/`)**:
    *   Define TypeORM entities that map to your database tables for `NewFeature`.
    *   Example: `newFeature.entity.ts`.

3.  **Repositories & Repository Module**:
    *   **Concrete Repository (`src/newfeature/infrastructure/repositories/newFeature.repository.ts`)**:
        Implement the `INewFeatureRepository` interface using TypeORM.
        ```typescript
        // src/newfeature/infrastructure/repositories/newFeature.repository.ts
        import { Injectable } from '@nestjs/common';
        import { InjectRepository } from '@nestjs/typeorm';
        import { Repository } from 'typeorm';
        import { NewFeature } from '../entities/newFeature.entity'; // TypeORM entity
        import { INewFeatureRepository } from '../../domain/interfaces/newFeatureRepository.interface';
        import { NewFeatureEntity } from '../../domain/entities/newFeature.entity'; // Domain entity
        import { NEWFEATURE_DB_CONNECTION_NAME } from '../../../databases/constants';

        @Injectable()
        export class NewFeatureRepository implements INewFeatureRepository {
          constructor(
            @InjectRepository(NewFeature, NEWFEATURE_DB_CONNECTION_NAME)
            private readonly ormRepository: Repository<NewFeature>,
          ) {}

          async findById(id: string): Promise<NewFeatureEntity | null> {
            const newFeature = await this.ormRepository.findOneBy({ id });
            // TODO: Map TypeORM entity to Domain entity if they differ
            return newFeature as NewFeatureEntity;
          }

          async save(entity: NewFeatureEntity): Promise<NewFeatureEntity> {
            // TODO: Map Domain entity to TypeORM entity if they differ
            const savedEntity = await this.ormRepository.save(entity);
            return savedEntity as NewFeatureEntity;
          }
          // ... other implementations
        }
        ```
    *   **Repository Module (`src/newfeature/infrastructure/repositories/newFeatureRepository.module.ts`)**:
        This module will provide the `NewFeatureRepository`.
        ```typescript
        // src/newfeature/infrastructure/repositories/newFeatureRepository.module.ts
        import { Module } from '@nestjs/common';
        import { TypeOrmModule } from '@nestjs/typeorm';
        import { NewFeature } from '../entities/newFeature.entity';
        import { NewFeatureRepository } from './newFeature.repository';
        import { NEWFEATURE_DB_CONNECTION_NAME } from '../../../databases/constants';

        @Module({
          imports: [
            TypeOrmModule.forFeature([NewFeature], NEWFEATURE_DB_CONNECTION_NAME),
          ],
          providers: [NewFeatureRepository],
          exports: [NewFeatureRepository],
        })
        export class NewFeatureRepositoryModule {}
        ```
        This pattern (e.g., `AgendaRepositoryModule`, `ArtistsRepositoryModule`) is crucial for the multi-DB setup and allows easy injection of repositories into use cases.

4.  **Controllers (`src/newfeature/infrastructure/controllers/`)**:
    *   Define controllers (e.g., `newfeature.controller.ts`) to handle HTTP requests.
    *   Use DTOs (`src/newfeature/infrastructure/dtos/`) with `class-validator` decorators for request validation and response shaping.
    *   Use Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.) for API documentation.
    *   Inject and call Use Cases.

5.  **Handlers (`src/newfeature/infrastructure/handlers/`) (Optional)**:
    *   If complex orchestration is needed between controllers and use cases, implement handlers.

### Step 3: Develop Use Cases (`src/newfeature/usecases/`)

1.  Create use case classes (e.g., `createNewFeature.usecase.ts`, `getNewFeatureById.usecase.ts`).
2.  Inject repository *interfaces* (not concrete implementations) defined in the domain layer. This adheres to the Dependency Inversion Principle.
    ```typescript
    // src/newfeature/usecases/createNewFeature.usecase.ts
    import { Inject, Injectable } from '@nestjs/common';
    import { INewFeatureRepository } from '../domain/interfaces/newFeatureRepository.interface';
    import { NewFeatureEntity } from '../domain/entities/newFeature.entity';
    // Assuming NewFeatureRepository is provided with a token like 'INewFeatureRepositoryToken'
    // or directly if the class name itself is used as token (common in NestJS)

    @Injectable()
    export class CreateNewFeatureUseCase {
      constructor(
        // Option 1: Using a string/symbol token (requires custom provider setup in module)
        // @Inject('INewFeatureRepositoryToken')
        // private readonly newFeatureRepository: INewFeatureRepository,

        // Option 2: Injecting the concrete class if it implements the interface
        // and is provided as such in the module.
        // For this to work, NewFeatureRepository should be in the providers array of newfeature.module.ts
        // or exported by an imported module (like NewFeatureRepositoryModule)
        private readonly newFeatureRepository: NewFeatureRepository, // if NewFeatureRepository implements INewFeatureRepository
      ) {}

      async execute(data: Partial<NewFeatureEntity>): Promise<NewFeatureEntity> {
        const newFeature = new NewFeatureEntity(/* ... create domain entity ... */);
        // ... business logic ...
        return this.newFeatureRepository.save(newFeature);
      }
    }
    ```
3.  Implement the business logic specific to each use case.

### Step 4: Assemble the Module (`src/newfeature/newfeature.module.ts`)

1.  Create `newfeature.module.ts`.
2.  **Imports**:
    *   Import the `NewFeatureRepositoryModule` to make repositories available for injection.
    *   Import `GlobalModule` if shared services are needed.
    *   Import other modules if there are dependencies (e.g., `MultimediasModule` if handling file uploads).
3.  **Controllers**: List all controllers for this feature.
4.  **Providers**: List all use cases, domain services, handlers, and any other providers specific to this module.
    ```typescript
    // src/newfeature/newfeature.module.ts
    import { Module } from '@nestjs/common';
    import { NewFeatureController } from './infrastructure/controllers/newfeature.controller';
    import { CreateNewFeatureUseCase } from './usecases/createNewFeature.usecase';
    import { GetNewFeatureByIdUseCase } from './usecases/getNewFeatureById.usecase';
    import { NewFeatureRepositoryModule } from './infrastructure/repositories/newFeatureRepository.module';
    // If NewFeatureRepository is used directly as token for INewFeatureRepository
    import { NewFeatureRepository } from './infrastructure/repositories/newFeature.repository';


    @Module({
      imports: [
        NewFeatureRepositoryModule, // Provides NewFeatureRepository
        // Other modules like MultimediasModule if needed
      ],
      controllers: [NewFeatureController],
      providers: [
        CreateNewFeatureUseCase,
        GetNewFeatureByIdUseCase,
        // If you need to provide NewFeatureRepository under an interface token:
        // {
        //   provide: 'INewFeatureRepositoryToken', // or a symbol
        //   useClass: NewFeatureRepository,
        // },
      ],
      exports: [
        // Export services or use cases if they need to be used by other modules
      ],
    })
    export class NewFeatureModule {}
    ```

### Step 5: Integrate into the Application

1.  **App Module**: Add `NewFeatureModule` to the `imports` array in `src/app.module.ts`.
    ```typescript
    // src/app.module.ts
    // ...
    import { NewFeatureModule } from './newfeature/newfeature.module';

    @Module({
      imports: [
        // ... other modules
        NewFeatureModule,
      ],
      // ...
    })
    export class AppModule {}
    ```
2.  **Global Configurations**:
    *   If the new module requires global configurations (e.g., environment variables not covered by its DB config), update the relevant files in `src/config/` and ensure they are loaded by the `ConfigModule` in `src/global/global.module.ts`.
    *   If the new module uses new global constants, add them to `src/constants.ts`.

## 5. Working with Multiple Databases

This project employs a multi-database architecture. This approach helps in:
*   **Denormalization**: Separating data for performance and scalability.
*   **Future Microservice Transition**: Making it easier to carve out services with their own dedicated databases.

**Key Concepts:**

*   **Dedicated Database Connections**: Each distinct data domain (e.g., agenda, artists, customers, and your `NewFeature`) can have its own database connection defined in `src/databases/database.module.ts` and configured in `src/config/database/`. Connection names are managed in `src/databases/constants.ts`.
*   **Repository Modules**:
    *   Modules like `AgendaRepositoryModule` (`src/agenda/infrastructure/repositories/agendaRepository.module.ts`), `ArtistsRepositoryModule` (`src/artists/infrastructure/repositories/artistRepository.module.ts`), and `CustomerRepositoryModule` (`src/customers/infrastructure/providers/customerProvider.module.ts`) are central to this strategy.
    *   Each `RepositoryModule` uses `TypeOrmModule.forFeature([Entity1, Entity2, ...], 'YOUR_CONNECTION_NAME')` to associate entities with a specific database connection.
    *   They then provide the concrete repository classes (e.g., `ArtistRepository`, `QuotationRepository`).
*   **Usage in Feature Modules**:
    *   Feature modules (e.g., `ArtistsModule` in `src/artists/artists.module.ts`) import these `RepositoryModules`.
    *   This allows use cases within the feature module to inject and use repositories that interact with the correct database, without the feature module itself needing to know the low-level details of the database connection.

Example: `src/artists/artists.module.ts` imports `ArtistsRepositoryModule` to access `ArtistRepository`, which uses the `'artist-db'` connection.

## 6. Notifications and Queues

The application uses a robust system for handling asynchronous operations and sending notifications, primarily built with Bull.js for queues and custom services for email and push notifications.

Refer to `docs/notifications-system.md` and `docs/notification-implementation.md` for detailed guides.

**Key Components & Flow:**

*   **Queues (`src/queues/`)**:
    *   Bull.js is used for managing job queues (e.g., `notificationsQueue`).
    *   Modules like `NotificationQueueModule` (`src/queues/notifications/notification.queue.module.ts`) configure these queues.
*   **Notification System (`src/notifications/`)**:
    1.  **Job Creation**: A use case adds a job to a specific queue (e.g., `notificationsQueue.add({ jobId: 'EVENT_STATUS_CHANGED', metadata: {...} })`).
    2.  **Processor**: A `NotificationProcessor` picks up jobs from the queue.
    3.  **Job Handler Factory**: Determines the correct handler for the job based on `jobId`.
    4.  **Job Handler (`src/queues/notifications/application/handlers/`)**: A specific class (e.g., `AgendaEventStatusChangedJobHandler`) processes the job. This handler will:
        *   Fetch necessary data.
        *   Optionally store the notification in the database using `NotificationStorageService`.
        *   Send email notifications via `EmailNotificationService`.
        *   Send push notifications via `PushNotificationService`.
*   **Email Notifications (`src/notifications/services/email/`)**:
    *   `EmailNotificationService`: Main service for sending emails (uses SendGrid).
    *   `TemplateService`: Compiles Handlebars templates (`src/notifications/services/email/templates/`).
    *   `TemplateRegistry` (`src/notifications/services/email/template.registry.ts`): Maps email types (Mail IDs) to their templates, subjects, and Zod schemas for validation.
    *   **Adding a new Email Type**:
        1.  Add `mailId` to `MailIdSchema` enum in `email.ts`.
        2.  Create a Zod schema for the email data.
        3.  Create an `.hbs` template file.
        4.  Add an entry to `TemplateRegistry`.
*   **Push Notifications (FCM) (`src/notifications/services/push/`)**:
    *   `PushNotificationService`: Sends notifications via Firebase Cloud Messaging (FCM).
    *   `NotificationRepository` (often part of the users/devices module): Manages FCM device tokens.
*   **Adding a New Notification Job/Event**:
    1.  **Job Schema**: Define a Zod schema for the job's `jobId` and `metadata` (e.g., in `src/queues/notifications/domain/schemas/agenda.ts`).
    2.  **Job ID Enum**: Add the new `jobId` to the relevant enum (e.g., `AgendaJobIdSchema`).
    3.  **Job Registry**: Update the `JobTypeSchemaRegistry` and the `NotificationJobRegistry` (or equivalent for other queues) to map the `jobId` to its schema and handler class.
    4.  **Job Handler**: Create a new handler class extending `NotificationJob` (or a base job class for the specific queue). Implement the `handle` method with the logic.
    5.  **Trigger**: Ensure a use case adds this new job type to the queue when the relevant event occurs.

## 7. Global Module and Shared Functionality

The `GlobalModule` (`src/global/global.module.ts`) plays a crucial role in providing shared services and configurations across the entire application.

*   **Providers**:
    *   `ConfigModule`: Centralized configuration management.
    *   `HttpModule`: For making HTTP requests.
    *   `S3Client`, `SMSClient`: Clients for interacting with AWS S3 and SMS services.
    *   `JwtModule`: For JWT generation and validation.
    *   `RequestContextService` (via `nestjs-cls`): For managing request-scoped data.
    *   `UniqueIdService`: For generating unique IDs.
    *   `DomainEventsService`: For dispatching domain events.
*   **Exports**: These providers are exported, making them available for injection in any module without needing to import `GlobalModule` explicitly (due to `@Global()`).
*   **Guards (`src/global/infrastructure/guards/`)**:
    *   `AuthGuard`: Protects routes requiring authentication (JWT-based).
    *   `RolesGuard`: Implements role-based access control.
    These guards can be applied globally or on specific controllers/routes.

## 8. Configuration Management

Application configuration is managed via `@nestjs/config`.

*   **Configuration Files (`src/config/`)**:
    *   Specific configuration files for different aspects (e.g., `app.config.ts`, `auth.config.ts`, `aws.config.ts`, database configs in `src/config/database/`).
    *   These use `registerAs` to create namespaced configuration objects.
    *   Joi schemas (e.g., `appConfigSchema`) are defined alongside to validate environment variables.
*   **Loading Configuration (`src/config/config.ts`)**: This file typically aggregates all individual configuration functions to be loaded by `ConfigModule`.
*   **`GlobalModule`**: Initializes `ConfigModule.forRoot()` with all configurations and validation schemas, making them globally available.
*   **Accessing Configuration**: Inject `ConfigService` or specific config objects (e.g., `appConfig.KEY`) into your services/controllers.

## 9. Handling Multimedia

Multimedia uploads (images, files) are handled by the `MultimediasModule`.

*   **`MultimediasModule` (`src/multimedias/multimedias.module.ts`)**:
    *   Provides `MultimediasService`.
*   **`MultimediasService` (`src/multimedias/services/multimedias.service.ts`)**:
    *   Handles file uploads, primarily to AWS S3.
    *   Uses `S3Client` (from `GlobalModule`) for S3 interactions.
    *   Contains methods for specific upload scenarios (e.g., post multimedias, work evidence, quotation reference images).
    *   Constructs CloudFront URLs for accessing uploaded files.
*   **Usage**: Inject `MultimediasService` into use cases or services that need to process file uploads. Files are typically received in controllers via Fastify's multipart handling.

## 10. Application Bootstrap and Entry Points

*   **`src/main.ts`**:
    *   The main entry point of the application.
    *   Uses `NestFactory` to create the NestJS application instance with `FastifyAdapter`.
    *   Calls `configure(app)` to apply global configurations.
    *   Retrieves app configuration (host, port) and starts the server.
*   **`src/app.module.ts`**:
    *   The root module of the application.
    *   Imports all major feature modules (e.g., `AgendaModule`, `ArtistsModule`, `UsersModule`, your `NewFeatureModule`), shared modules (`GlobalModule`, `DatabasesModule`), and queue modules.
*   **`src/configure.ts`**:
    *   A function that applies global configurations to the NestJS application instance. This typically includes:
        *   Global pipes (e.g., `ValidationPipe`).
        *   Global exception filters.
        *   CORS setup.
        *   API prefixing.
        *   Swagger (OpenAPI) documentation setup.
*   **`src/constants.ts`**:
    *   A file for storing global, application-wide constants (e.g., `SERVICE_NAME`, specific string tokens, default values).

## 11. Testing

A comprehensive testing strategy is vital. While not detailed here, remember to:
*   Write **unit tests** for use cases, domain services, and complex logic within providers.
*   Write **integration tests** for repository interactions and communication between layers.
*   Write **end-to-end (e2e) tests** for API endpoints.
*   Utilize Jest as the testing framework.
*   Employ `jest-mock` for simple mocks and `ts-mockito` for more complex mocking scenarios.
*   Follow the AAA (Arrange-Act-Assert) pattern in tests.

## 12. Conclusion

This guide provides a foundational "template" for developing new modules within the Inker backend. By following these architectural patterns and practices, developers can contribute to a codebase that is consistent, scalable, maintainable, and robust. Remember to consult existing modules for concrete examples and always prioritize clean code and separation of concerns. 