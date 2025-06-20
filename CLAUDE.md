# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Inker Backend** is a tattoo artist marketplace platform built with NestJS v9 and Fastify. It connects tattoo artists with customers for appointment booking, portfolio management, and social features.

## Common Development Commands

### Running the Application
```bash
npm run start:dev      # Start development server with hot reload
npm run build         # Build the TypeScript project
npm run start:prod    # Start production server
```

### Testing
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Run tests with coverage report
npm run test:watch    # Run tests in watch mode
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix linting issues automatically
npm run format        # Format code with Prettier
npm run prettier      # Check code formatting
```

### Database & Infrastructure
```bash
npm run redis         # Start Redis container for queue management
```

## Architecture Overview

### Clean Architecture Pattern
The codebase follows Clean Architecture principles with clear separation of concerns:

1. **Domain Layer** (`/domain`): Business logic, DTOs, interfaces, models
2. **Infrastructure Layer** (`/infrastructure`): Controllers, entities, repositories, external integrations
3. **Use Cases Layer** (`/usecases`): Application-specific business logic

### Module Structure
Each module follows this consistent structure:
```
src/[module-name]/
├── domain/
│   ├── dtos/
│   ├── interfaces/
│   ├── models/
│   └── enums/
├── infrastructure/
│   ├── controllers/
│   ├── entities/
│   └── repositories/
└── usecases/
```

### Multi-Database Strategy
The application uses separate databases for different bounded contexts:
- `user-db`: Authentication and user management
- `artist-db`: Artist profiles and portfolios
- `customer-db`: Customer data
- `agenda-db`: Appointments and scheduling
- `analytics-db`: Metrics and analytics

### Key Architectural Components

1. **Global Module**: Provides shared services (JWT, AWS, configuration, event handling)
2. **Queue Processing**: Bull queues for async operations (notifications, PDF generation)
3. **WebSocket Gateways**: Real-time features (chat, alerts)
4. **State Machines**: Complex workflows (quotations, appointments)
5. **Repository Pattern**: All data access through repositories
6. **Use Case Pattern**: Business logic extends `BaseUseCase`

### External Integrations
- **AWS S3**: File storage
- **SendGrid**: Email notifications
- **Firebase**: Push notifications
- **Google Places API**: Location services
- **Runware API**: AI tattoo generation
- **Cloudflare Images**: Image CDN (migration in progress)

## Important Development Notes

### Authentication
- JWT-based authentication with role-based access control
- User types: Admin, Artist, Customer
- Auth guards protect endpoints based on roles

### File Uploads
- Multipart form data handling with Fastify
- Images stored in AWS S3
- Migration to Cloudflare Images in progress

### Queue Jobs
- Notification reminders (24h, 48h before appointments)
- PDF generation for consent forms
- Penalty processing for no-shows
- Analytics aggregation

### Testing Strategy
- Unit tests for use cases and services
- Integration tests for repositories
- E2E tests for complete API flows
- Mock external services in tests

### Environment Configuration
- Copy `.env.example` to `.env` for local development
- All configuration validated through Joi schemas
- Sensitive data never committed to repository

### API Documentation
- Swagger UI available at `/swagger` in development
- OpenAPI spec generated from decorators
- Postman collection in `/postman` directory

## Current Work in Progress

Based on git status:
- Places module: Google Places integration
- Cloudflare Images migration
- Reminder system enhancements
- Work evidence feature
- Artist action improvements