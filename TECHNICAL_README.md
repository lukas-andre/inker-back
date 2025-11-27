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
