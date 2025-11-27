# Consent Module: Frontend Integration Guide

## 1. Overview
This document provides guidance for frontend developers integrating with the Consent Module of the Inker backend. It details available API endpoints, request/response contracts (DTOs), example usages, and relevant enumerations.

This module allows artists to manage consent form templates and customers to sign these consents, typically in relation to an appointment (event).

## 2. Authentication
All endpoints within the Consent Module require authentication via JWT. Ensure that a valid JWT is included in the `Authorization` header for all requests:

`Authorization: Bearer <YOUR_JWT_TOKEN>`

The `userId` for operations like signing consent, or a `callingArtistId` for template creation, will typically be derived from this JWT on the backend and validated against the request data where necessary.

## 3. Data Structures

### 3.1. Enums

#### `ConsentType`
Defines the type or category of the consent form template.
*Source: `src/agenda/domain/enum/consentType.enum.ts`*
```typescript
export enum ConsentType {
  GENERAL_TERMS = 'GENERAL_TERMS',
  TATTOO_CONSENT = 'TATTOO_CONSENT',
  IMAGE_RELEASE = 'IMAGE_RELEASE',
  OTHER = 'OTHER',
  // Actual values may vary based on implementation
}
```

### 3.2. `FormSchema`
Describes the structure of the dynamic form content within a `FormTemplateEntity`. The `content` field of a form template should adhere to this interface.
*Source: `src/agenda/infrastructure/entities/formTemplate.entity.ts`*
```typescript
export interface FormSchemaField {
  type: string; // e.g., 'checkbox', 'signature', 'text', 'date', 'radio', 'dropdown', 'textarea'
  label: string; // User-friendly label for the field
  name: string; // Unique identifier for the field, used as a key in signedData
  required: boolean;
  options?: Array<{ label: string; value: string | boolean | number }> | string[]; // For type: 'checkbox' (multi-select), 'radio', 'dropdown'
  placeholder?: string; // Placeholder text for input fields
  defaultValue?: any; // Default value for the field
  validation?: Record<string, any>; // e.g., { minLength: 5, pattern: '^[A-Za-z]+$', min: 0, max: 100 }
}

export interface FormSchemaLogicCondition {
  field: string; // `name` of the field triggering the logic
  condition: string; // e.g., 'IS_CHECKED', 'EQUALS_VALUE', 'IS_FILLED', 'GREATER_THAN'
  value?: any; // Value to compare against for some conditions (e.g., for 'EQUALS_VALUE')
}

export interface FormSchemaLogic {
  showIf?: FormSchemaLogicCondition[]; // Array of conditions (AND logic if multiple, OR can be implemented with multiple logic entries or complex conditions)
  // hideIf?: FormSchemaLogicCondition[];
  // requireIf?: FormSchemaLogicCondition[];
}

export interface FormSchema {
  title: string; // Title of the form or form section
  description?: string; // Optional description for the form or section
  fields: FormSchemaField[];
  logic?: Record<string, FormSchemaLogic>; // Key is the `name` of the field this logic applies to (the field being shown/hidden/required)
}
```
**Note on `FormSchema.content`**: The `content` field in `FormTemplateEntity` is `jsonb` and should store an object that implements the `FormSchema` interface.

## 4. API Endpoints

Base path for these endpoints: `/consent` (This is an assumption; actual base path might vary depending on global prefix and controller path).

### 4.1. Form Templates

#### 4.1.1. Create Form Template
*   **Endpoint**: `POST /templates`
*   **Description**: Allows an authenticated artist to create a new consent form template. The `artistId` in the DTO must match the `artistId` derived from the authenticated user's JWT.
*   **Request DTO**: `CreateFormTemplateDto`
    ```typescript
    // Based on src/consent-module/domain/dtos/create-form-template.dto.ts
    export class CreateFormTemplateDto {
      title: string;        // Title of the template
      content: FormSchema;  // Form structure and fields (adheres to FormSchema interface)
      version: number;      // Version number, e.g., 1
      consentType: ConsentType; // Type of consent (e.g., GENERAL_TERMS)
      artistId: string;     // Artist's UUID (must match logged-in artist)
      isActive?: boolean;   // Optional, defaults to true on the backend
    }
    ```
*   **Example Request**:
    ```json
    {
      "title": "Standard Tattoo Consent Form",
      "content": {
        "title": "Tattoo Procedure Consent",
        "description": "Please read and fill out the following information carefully.",
        "fields": [
          { "type": "text", "label": "Full Name", "name": "fullName", "required": true, "placeholder": "Enter your full name" },
          { "type": "date", "label": "Date of Birth", "name": "dob", "required": true },
          { "type": "checkbox", "label": "I confirm I am over 18 years of age.", "name": "isOver18", "required": true, "options": [{"label": "Yes, I confirm", "value": true}] },
          { "type": "textarea", "label": "Medical Conditions (if any)", "name": "medicalConditions", "required": false, "placeholder": "List any relevant medical conditions or allergies" },
          { "type": "signature", "label": "Client Signature", "name": "clientSignature", "required": true }
        ]
      },
      "version": 1,
      "consentType": "TATTOO_CONSENT",
      "artistId": "artist-uuid-from-jwt"
    }
    ```
*   **Response DTO**: `FormTemplateResponseDto` (Reflects the created `FormTemplateEntity`)
    ```typescript
    export class FormTemplateResponseDto {
      id: string;
      title: string;
      content: FormSchema;
      version: number;
      consentType: ConsentType;
      artistId: string;
      isActive: boolean;
      createdAt: string; // ISO Date string (e.g., "2023-10-27T10:00:00.000Z")
      updatedAt: string; // ISO Date string
    }
    ```
*   **Example Response (201 Created)**:
    ```json
    {
      "id": "template-uuid-12345",
      "title": "Standard Tattoo Consent Form",
      "content": { /* ... as in request ... */ },
      "version": 1,
      "consentType": "TATTOO_CONSENT",
      "artistId": "artist-uuid-from-jwt",
      "isActive": true,
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request`: DTO validation failure (e.g., missing required fields, invalid `consentType`).
    *   `401 Unauthorized`: JWT token missing or invalid.
    *   `403 Forbidden`: Authenticated user (`callingArtistId`) does not match `artistId` in the payload.
    *   `409 Conflict`: A template with the same `artistId`, `title`, `consentType`, and `version` already exists.

#### 4.1.2. Get Form Template by ID
*   **Endpoint**: `GET /templates/:templateId`
*   **Description**: Retrieves a specific form template by its ID. Authorization rules apply (e.g., only the owner artist or users associated with an event that uses this template can access it).
*   **Path Parameters**:
    *   `templateId: string` (UUID of the form template)
*   **Response DTO**: `FormTemplateResponseDto`
*   **Example Response (200 OK)**: (Similar to the create response for a single template)
*   **Error Responses**:
    *   `401 Unauthorized`.
    *   `403 Forbidden`: User not authorized to access this template.
    *   `404 Not Found`: Template with the given ID doesn't exist or is not accessible (e.g., inactive and not owner, or no permission).

#### 4.1.3. Get Form Templates for an Artist
*   **Endpoint**: `GET /templates/artist/:artistId`
*   **Description**: Retrieves a list of form templates belonging to a specific artist. Typically used by an artist to manage their templates. The authenticated user must be the artist specified by `artistId` or have administrative privileges.
*   **Path Parameters**:
    *   `artistId: string` (UUID of the artist)
*   **Query Parameters (Optional)**:
    *   `isActive?: boolean` (Filter by active status, e.g., `?isActive=true`)
*   **Response DTO**: `FormTemplateResponseDto[]` (Array of `FormTemplateResponseDto`)
*   **Example Response (200 OK)**:
    ```json
    [
      {
        "id": "template-uuid-12345",
        "title": "Standard Tattoo Consent Form",
        "version": 1,
        "consentType": "TATTOO_CONSENT",
        "artistId": "artist-uuid-from-jwt",
        "isActive": true,
        /* ... other fields ... */
      },
      {
        "id": "template-uuid-67890",
        "title": "Image Release Form",
        "version": 2,
        "consentType": "IMAGE_RELEASE",
        "artistId": "artist-uuid-from-jwt",
        "isActive": true,
        /* ... other fields ... */
      }
    ]
    ```
*   **Error Responses**:
    *   `401 Unauthorized`.
    *   `403 Forbidden`: If the authenticated user is not the specified `artistId`.

### 4.2. Signed Consents

#### 4.2.1. Sign a Consent Form
*   **Endpoint**: `POST /signatures`
*   **Description**: Allows an authenticated user (typically a customer) to submit a signed consent form. The `userId` is derived from the JWT.
*   **Request DTO**: `SignConsentDto`
    ```typescript
    // Based on src/consent-module/domain/dtos/sign-consent.dto.ts
    export class SignConsentDto {
      eventId: string;          // UUID of the AgendaEvent this consent is for
      formTemplateId?: string; // Optional: UUID of the FormTemplate being signed. If null, implies a generic consent or one defined by event type.
      signedData: Record<string, any>; // Key-value pairs from the form. Keys should match field `name` in FormSchema.
      digitalSignature: string; // Representation of the signature (e.g., Base64 encoded image, or a typed name if allowed by template)
    }
    ```
*   **Example Request**:
    ```json
    {
      "eventId": "event-uuid-abcde",
      "formTemplateId": "template-uuid-12345",
      "signedData": {
        "fullName": "Jane Doe",
        "dob": "1990-05-15",
        "isOver18": true,
        "medicalConditions": "None",
        "clientSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
      },
      "digitalSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." // Or "Jane Doe Typed"
    }
    ```
*   **Response DTO**: `SignedConsentResponseDto` (Reflects the created `SignedConsentEntity`)
    ```typescript
    export class SignedConsentResponseDto {
      id: string;
      eventId: string;
      formTemplateId?: string;
      // formTemplate?: FormTemplateResponseDto; // Could be populated depending on backend logic
      signedData: Record<string, any>;
      digitalSignature: string;
      signedAt: string; // ISO Date string
      userId: string;   // UUID of the user who signed
      ipAddress?: string; // Captured by backend
      userAgent?: string; // Captured by backend
    }
    ```
*   **Example Response (201 Created)**:
    ```json
    {
      "id": "signature-uuid-fghij",
      "eventId": "event-uuid-abcde",
      "formTemplateId": "template-uuid-12345",
      "signedData": { /* ... as in request ... */ },
      "digitalSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      "signedAt": "2023-10-27T11:30:00.000Z",
      "userId": "customer-uuid-from-jwt",
      "ipAddress": "123.123.123.123",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request`: DTO validation failure, event status not suitable for signing (e.g., already completed/cancelled), or `formTemplateId` provided but template is inactive or belongs to a different artist than the event's artist.
    *   `401 Unauthorized`.
    *   `404 Not Found`: If `eventId` or `formTemplateId` (if provided) does not exist.
    *   `409 Conflict`: If the user has already signed this specific consent (same `formTemplateId` or generic if `formTemplateId` is null) for this `eventId`.

#### 4.2.2. Get Signed Consent by ID
*   **Endpoint**: `GET /signatures/:signatureId`
*   **Description**: Retrieves a specific signed consent record by its ID. Access is typically restricted to the user who signed it, the artist associated with the event, or administrators.
*   **Path Parameters**:
    *   `signatureId: string` (UUID of the signed consent)
*   **Query Parameters (Optional)**:
    *   `include?: string` (e.g., `?include=formTemplate,event` to sideload related entities)
*   **Response DTO**: `SignedConsentResponseDto` (Potentially with `formTemplate` and `event` details if requested via `include`)
*   **Example Response (200 OK)**: (Similar to the create response, may include populated `formTemplate` details)
*   **Error Responses**:
    *   `401 Unauthorized`.
    *   `403 Forbidden`: User not authorized to view this signed consent.
    *   `404 Not Found`: Signed consent with the given ID doesn't exist.

#### 4.2.3. Get Signed Consents for an Event
*   **Endpoint**: `GET /signatures/event/:eventId`
*   **Description**: Retrieves all signed consent records associated with a specific event. Typically accessed by the artist of the event or authorized staff.
*   **Path Parameters**:
    *   `eventId: string` (UUID of the event)
*   **Response DTO**: `SignedConsentResponseDto[]`
*   **Error Responses**:
    *   `401 Unauthorized`.
    *   `403 Forbidden`: User not authorized to view consents for this event.
    *   `404 Not Found`: If the event itself doesn't exist (though usually this would return an empty array if event exists but has no consents).

#### 4.2.4. Get Signed Consents for an Event by a Specific User
*   **Endpoint**: `GET /signatures/event/:eventId/user/:userId`
*   **Description**: Retrieves signed consent records for a specific event, filtered by the user who signed them. Useful for a customer to see their own signed documents for an event, or for an artist to review a specific customer's submissions for an event. The authenticated user must either be the `userId` in the path or the artist of the event (or admin).
*   **Path Parameters**:
    *   `eventId: string` (UUID of the event)
    *   `userId: string` (UUID of the user who signed)
*   **Response DTO**: `SignedConsentResponseDto[]`
*   **Error Responses**:
    *   `401 Unauthorized`.
    *   `403 Forbidden`.
    *   `404 Not Found` (though typically returns empty array if no records match).

## 5. Frontend Workflow Considerations

1.  **Artist: Template Management**:
    *   Artists create and manage their templates (`POST /templates`, `GET /templates/artist/:artistId`).
    *   The frontend should provide a UI for building the `FormSchema` (`content` field).

2.  **Customer: Consent Signing Process**:
    *   **Identifying Required Consents**: When a customer is to sign consents for an event, the frontend needs to determine which forms are required. This could be achieved by:
        *   The `AgendaEvent` entity having a list of required `formTemplateId`s.
        *   A dedicated endpoint like `GET /templates/event/:eventId/required` (not detailed above, but a likely requirement) that returns templates needing signature for that event.
    *   **Fetching Template Details**: For each required consent, fetch the `FormTemplateEntity` using `GET /templates/:templateId` to get the `FormSchema` for rendering.
    *   **Rendering the Form**: Dynamically render the form based on `FormSchema.fields` and apply any `FormSchema.logic`.
    *   **Collecting Data**: Collect user input for each field and the digital signature.
    *   **Submitting Signed Consent**: Send the data via `POST /signatures`.

3.  **Viewing Signed Consents**:
    *   Both customers and artists (for their events) should be able to view submitted consents (`GET /signatures/:signatureId`, `GET /signatures/event/:eventId`, etc.).
    *   The frontend would fetch the `SignedConsentEntity` (which includes `signedData`) and potentially the original `FormTemplateEntity` (if `formTemplateId` is present and an `include` parameter is used or data is nested) to render a read-only view of the filled form.

4.  **Digital Signature Handling**: The `digitalSignature` field is a string. The frontend can capture a signature using a canvas library, convert it to a Base64 encoded image string (e.g., `data:image/png;base64,...`), or simply use a typed name if the form template design allows.

## 6. Further Considerations

*   **Versioning of Templates**: If a template is updated (new version), the system needs to decide if previously signed consents (against older versions) remain valid or if re-signing is needed. Signed consents store `formTemplateId`, which should point to a specific version implicitly or explicitly if versions are separate entities.
*   **PDF Generation**: After signing, a PDF version of the signed consent might be generated and stored. This is likely an asynchronous backend process, potentially triggered after `POST /signatures` is successful.
*   **Error Handling**: The frontend should gracefully handle API error responses, providing appropriate feedback to the user. 