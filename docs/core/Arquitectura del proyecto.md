# Agenda Module Architecture

This document outlines the architecture of the Agenda module, showcasing the typical request flow and structural organization within this NestJS application. The principles described here are generally applicable to other modules in the project.

## Architectural Flow

The application follows a layered architecture, promoting separation of concerns and modularity. The typical request lifecycle in the Agenda module (and generally across the application) is as follows:

**Controller -> Handler -> Use Case -> Providers (Repositories/Services) -> Database**

Let's break down each component:

1.  **Controllers (`infrastructure/controllers`)**
    *   **Role:** Act as the primary entry point for incoming HTTP requests. They are responsible for receiving requests, performing initial validation (often through pipes and DTOs), and delegating the processing to the appropriate Handler or Use Case.
    *   **Framework:** Built using NestJS and typically leverage Fastify for HTTP request handling.
    *   **Example:** `AgendaPublicController` might handle requests related to public agenda information, while `AgendaPrivateController` handles requests requiring authentication.

2.  **Handlers (`infrastructure/handlers`)**
    *   **Role:** Serve as an intermediary layer between Controllers and Use Cases. They can be responsible for more complex request transformation, orchestration of multiple use cases, or specific infrastructure-related concerns before the core business logic is invoked.
    *   **Example:** `AgendaHandler` in this module likely coordinates various agenda-related operations, deciding which use case to call based on the request specifics.

3.  **Use Cases (`usecases`)**
    *   **Role:** Encapsulate the application-specific business rules and logic. They orchestrate the flow of data and interactions between domain entities and infrastructure services (like repositories). Each use case represents a single, specific task the application can perform (e.g., `CreateAgendaEventUseCase`, `UpdateAgendaSlotUseCase`).
    *   **Characteristics:**
        *   Independent of the delivery mechanism (e.g., HTTP, WebSockets).
        *   Depend on abstractions (interfaces) for infrastructure concerns, not concrete implementations.
    *   **Organization:** Often grouped by feature or entity (e.g., `usecases/agenda`, `usecases/event`).

4.  **Providers (Repositories in `infrastructure/repositories`, Services in `services` or imported modules)**
    *   **Role:** Provide concrete implementations for infrastructure concerns. This includes database interactions (Repositories), communication with external services, sending notifications, etc.
    *   **Repositories (`infrastructure/repositories`):**
        *   Abstract the data persistence logic. They define methods for CRUD operations and complex queries related to specific entities (e.g., `AgendaRepository`, `EventRepository`).
        *   Typically use TypeORM entities to interact with the database.
    *   **Services (e.g., `services/scheduling.service.ts`, or services from other imported NestJS modules):**
        *   Encapsulate other infrastructural or shared business logic that doesn't fit neatly into a repository or use case.
        *   **Imported Modules:** A key aspect of this architecture is that many providers are self-contained NestJS modules, imported where needed. This promotes reusability and a microservice-like approach to module design. For example, a `NotificationsProvider` or `PaymentProvider` would be its own module, injected into use cases that require its functionality. These providers form the core building blocks of the application's capabilities.

5.  **Database (via TypeORM)**
    *   **Role:** The persistence layer. TypeORM is used as the Object-Relational Mapper (ORM) to interact with the database.
    *   **Entities (`infrastructure/entities` or `domain` for core entities):** Define the structure of the database tables and their relationships.
    *   **Interaction:** Repositories use TypeORM entities and its query builder/repository patterns to perform database operations.

## Data Transfer Objects (DTOs)

*   **Role:** DTOs are crucial for defining the shape of data exchanged between different layers, especially for incoming requests and outgoing responses. They ensure data integrity and provide a clear contract.
*   **Locations:**
    *   `domain/dtos`: DTOs that are closely tied to the core business logic or domain entities.
    *   `infrastructure/dtos`: DTOs specific to the infrastructure layer, such as those used by controllers for request/response shaping.
*   **Validation:** `class-validator` decorators are extensively used within DTO classes to automatically validate incoming data, ensuring that it meets the required format and constraints before being processed by handlers or use cases.

## Domain Layer (`domain`)

The domain layer is the heart of the module, containing the core business logic and rules, independent of any infrastructure concerns.

*   **Entities (conceptual):** Represent core business objects and their state (e.g., an `Agenda`, an `Event`). While TypeORM entities might reside in `infrastructure/entities` for persistence, the conceptual domain entities guide the business logic.
*   **Domain Services (`domain/services`):** Contain business logic that doesn't naturally fit within a single entity.
*   **Domain Events (`domain/events`):** Represent significant occurrences within the domain that other parts of the application might react to.
*   **Enums (`domain/enum`):** Define sets of named constants relevant to the domain.
*   **Custom Errors (`domain/errors`):** Define specific error types that represent business rule violations or exceptional states within the domain.

## Example Flow: Creating an Agenda Event

1.  A `POST` request hits an endpoint on an `AgendaController` (e.g., `/agenda/events`).
2.  The controller's method uses a DTO (e.g., `CreateEventDto`) decorated with `class-validator` to validate the request body.
3.  The controller delegates the validated DTO to the `AgendaHandler`.
4.  The `AgendaHandler` might perform some initial checks or transformations and then invokes a specific use case, for example, `CreateEventUseCase.execute(dto)`.
5.  The `CreateEventUseCase` contains the logic for creating a new event. It might:
    *   Instantiate a domain entity for the event.
    *   Perform business rule validations (e.g., check for scheduling conflicts using a `SchedulingService` or another use case).
    *   Interact with the `EventRepository` (a Provider) to persist the new event entity to the database.
6.  The `EventRepository` uses TypeORM to save the event data.
7.  The use case returns the result (e.g., the created event or a success message) back through the handler and controller.
8.  The controller formats the response, possibly using another DTO, and sends it back to the client.

## Key Architectural Principles

*   **Clean Architecture:** Strong separation between the domain, application (use cases), and infrastructure layers.
*   **Dependency Injection:** NestJS's built-in DI system is used extensively to manage dependencies and promote loose coupling.
*   **Modularity:** Each feature or bounded context (like Agenda) is organized into its own module, promoting maintainability and scalability. Providers are often designed as reusable modules.
*   **SOLID Principles:** Guiding principles for writing maintainable and flexible code.

This architectural approach ensures that the Agenda module (and the application as a whole) is robust, testable, and adaptable to future changes. 