# 🧪 QA Test Scenarios - Event Flow Complete

## 📋 Overview
Este documento contiene scenarios de testing profesional en formato Gherkin para validar el flujo completo de eventos en Inker, incluyendo el nuevo sistema de consentimientos.

## 🎯 Cobertura de Testing

### **Módulos Cubiertos:**
- ✅ Event State Machine
- ✅ Consent Management
- ✅ Event Actions Engine
- ✅ User Permissions
- ✅ Business Rules
- ✅ Edge Cases

### **Estados del Evento:**
- CREATED
- PENDING_CONFIRMATION
- CONFIRMED
- PAYMENT_PENDING
- IN_PROGRESS
- COMPLETED
- WAITING_FOR_PHOTOS
- WAITING_FOR_REVIEW
- REVIEWED
- RESCHEDULED
- CANCELED
- AFTERCARE_PERIOD
- DISPUTE_OPEN

---

## 🔥 FEATURE: Consent Management

### Background
```gherkin
Background:
  Given the default consent template exists in the database
  And I have the following users:
    | id           | type     | name          |
    | customer-123 | CUSTOMER | John Doe      |
    | artist-456   | ARTIST   | Jane Artist   |
```

### Scenario: Customer checks consent status for new event
```gherkin
Scenario: Customer checks consent status for new event
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CREATED"
  And the event belongs to customer "customer-123"
  When I GET "/consents/check-consent-status/event-abc"
  Then the response status should be 200
  And the response should contain:
    | field     | value     |
    | eventId   | event-abc |
    | hasSigned | false     |
  And the "signedAt" field should not be present
  And the "templateTitle" field should not be present
```

### Scenario: Customer accepts default terms successfully
```gherkin
Scenario: Customer accepts default terms successfully
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CREATED"
  And the customer has NOT signed consent for this event
  When I POST "/consents/accept-default-terms" with:
    """
    {
      "eventId": "event-abc",
      "digitalSignature": "John Doe"
    }
    """
  Then the response status should be 201
  And the response should contain "signedData"
  And the response should contain "signedAt"
  And the signed consent should be stored in the database
  And the "signedData.acceptGeneralTerms" should be true
  And the "signedData.clientName" should be "John Doe"
```

### Scenario: Customer cannot accept terms twice for same event
```gherkin
Scenario: Customer cannot accept terms twice for same event
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CREATED"
  And the customer has ALREADY signed consent for this event
  When I POST "/consents/accept-default-terms" with:
    """
    {
      "eventId": "event-abc",
      "digitalSignature": "John Doe"
    }
    """
  Then the response status should be 409
  And the response should contain "Terms and conditions have already been accepted"
```

### Scenario: Artist cannot accept consent terms
```gherkin
Scenario: Artist cannot accept consent terms
  Given I am authenticated as "artist-456"
  And there is an event "event-abc" with status "CREATED"
  When I POST "/consents/accept-default-terms" with:
    """
    {
      "eventId": "event-abc",
      "digitalSignature": "Jane Artist"
    }
    """
  Then the response status should be 403
  And the response should contain "Only customers can accept terms"
```

---

## 🔄 FEATURE: Event State Machine with Consent Integration

### Scenario: Customer cannot confirm event without accepting consent
```gherkin
Scenario: Customer cannot confirm event without accepting consent
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "PENDING_CONFIRMATION"
  And the customer has NOT signed consent for this event
  When I POST "/agenda/events/event-abc/confirm"
  Then the response status should be 422
  And the response should contain "Required consents are not signed"
  And the event status should remain "PENDING_CONFIRMATION"
```

### Scenario: Customer can confirm event after accepting consent
```gherkin
Scenario: Customer can confirm event after accepting consent
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "PENDING_CONFIRMATION"
  And the customer has signed consent for this event
  When I POST "/agenda/events/event-abc/confirm"
  Then the response status should be 200
  And the event status should be "CONFIRMED"
  And a confirmation notification should be sent
```

### Scenario: Artist can confirm event without consent requirement
```gherkin
Scenario: Artist can confirm event without consent requirement
  Given I am authenticated as "artist-456"
  And there is an event "event-abc" with status "PENDING_CONFIRMATION"
  And the artist owns this event
  And the customer has NOT signed consent
  When I POST "/agenda/events/event-abc/confirm"
  Then the response status should be 200
  And the event status should be "CONFIRMED"
```

---

## ⚡ FEATURE: Event Actions Engine

### Scenario: Customer sees consent action for new event
```gherkin
Scenario: Customer sees consent action for new event
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CREATED"
  And the customer has NOT signed consent
  When I GET "/agenda/events/event-abc/actions"
  Then the response status should be 200
  And the response should contain:
    | field             | value |
    | canAcceptConsent  | true  |
    | canConfirmEvent   | true  |
    | canRejectEvent    | true  |
    | canCancel         | true  |
    | canEdit           | false |
    | canReschedule     | false |
```

### Scenario: Customer sees updated actions after accepting consent
```gherkin
Scenario: Customer sees updated actions after accepting consent
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "PENDING_CONFIRMATION"
  And the customer has signed consent for this event
  When I GET "/agenda/events/event-abc/actions"
  Then the response status should be 200
  And the response should contain:
    | field             | value |
    | canAcceptConsent  | false |
    | canConfirmEvent   | true  |
    | canRejectEvent    | true  |
  And the "reasons.canAcceptConsent" should contain "Only customers need to accept"
```

### Scenario: Artist actions are not affected by consent requirements
```gherkin
Scenario: Artist actions are not affected by consent requirements
  Given I am authenticated as "artist-456"
  And there is an event "event-abc" with status "CONFIRMED"
  And the artist owns this event
  When I GET "/agenda/events/event-abc/actions"
  Then the response status should be 200
  And the response should contain:
    | field             | value |
    | canAcceptConsent  | false |
    | canEdit           | true  |
    | canCancel         | true  |
    | canReschedule     | true  |
  And the "reasons.canAcceptConsent" should contain "Only customers need to accept"
```

---

## 🎬 FEATURE: Complete Event Lifecycle

### Scenario: Happy path - Event from creation to completion
```gherkin
Scenario: Happy path - Event from creation to completion
  Given I am authenticated as "artist-456"
  And I create an event "event-abc" with status "CREATED"
  
  # Step 1: Request confirmation
  When I POST "/agenda/events/event-abc/request-confirmation"
  Then the event status should be "PENDING_CONFIRMATION"
  And a notification should be sent to the customer
  
  # Step 2: Customer accepts consent
  Given I am authenticated as "customer-123"
  When I POST "/consents/accept-default-terms" with event "event-abc"
  Then the consent should be accepted successfully
  
  # Step 3: Customer confirms event
  When I POST "/agenda/events/event-abc/confirm"
  Then the event status should be "CONFIRMED"
  And both parties should receive confirmation notifications
  
  # Step 4: Artist starts session
  Given I am authenticated as "artist-456"
  When I POST "/agenda/events/event-abc/start-session"
  Then the event status should be "IN_PROGRESS"
  And session start notifications should be sent
  
  # Step 5: Artist completes session
  When I POST "/agenda/events/event-abc/complete-session"
  Then the event status should be "COMPLETED"
  And completion notifications should be sent
  
  # Step 6: Request photos
  When I POST "/agenda/events/event-abc/request-photos"
  Then the event status should be "WAITING_FOR_PHOTOS"
  
  # Step 7: Add photos
  When I POST "/agenda/events/event-abc/add-photos"
  Then the event status should be "WAITING_FOR_REVIEW"
  
  # Step 8: Customer leaves review
  Given I am authenticated as "customer-123"
  When I POST "/agenda/events/event-abc/add-review"
  Then the event status should be "REVIEWED"
  
  # Step 9: Start aftercare
  When I POST "/agenda/events/event-abc/start-aftercare"
  Then the event status should be "AFTERCARE_PERIOD"
```

---

## 🚫 FEATURE: Event Cancellation Rules

### Scenario: Customer can cancel with sufficient notice
```gherkin
Scenario: Customer can cancel with sufficient notice
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CONFIRMED"
  And the event starts in 48 hours
  When I POST "/agenda/events/event-abc/cancel" with reason "Personal emergency"
  Then the response status should be 200
  And the event status should be "CANCELED"
  And both parties should receive cancellation notifications
```

### Scenario: Customer cannot cancel with insufficient notice
```gherkin
Scenario: Customer cannot cancel with insufficient notice
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CONFIRMED"
  And the event starts in 12 hours
  When I POST "/agenda/events/event-abc/cancel" with reason "Changed my mind"
  Then the response status should be 422
  And the response should contain "24 hours notice"
  And the event status should remain "CONFIRMED"
```

### Scenario: Artist can cancel anytime before session starts
```gherkin
Scenario: Artist can cancel anytime before session starts
  Given I am authenticated as "artist-456"
  And there is an event "event-abc" with status "CONFIRMED"
  And the event starts in 2 hours
  When I POST "/agenda/events/event-abc/cancel" with reason "Equipment failure"
  Then the response status should be 200
  And the event status should be "CANCELED"
```

---

## 🔄 FEATURE: Event Rescheduling

### Scenario: Customer can reschedule with sufficient notice
```gherkin
Scenario: Customer can reschedule with sufficient notice
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CONFIRMED"
  And the event starts in 72 hours
  When I POST "/agenda/events/event-abc/reschedule" with:
    """
    {
      "newStartDate": "2024-01-15T14:00:00Z",
      "newEndDate": "2024-01-15T17:00:00Z",
      "reason": "Work conflict"
    }
    """
  Then the response status should be 200
  And the event status should be "RESCHEDULED"
  And the event dates should be updated
  And both parties should receive reschedule notifications
```

### Scenario: Customer cannot reschedule with insufficient notice
```gherkin
Scenario: Customer cannot reschedule with insufficient notice
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CONFIRMED"
  And the event starts in 24 hours
  When I POST "/agenda/events/event-abc/reschedule" with new dates
  Then the response status should be 422
  And the response should contain "48 hours notice"
```

### Scenario: Customer cannot reschedule more than 3 times in 7 days
```gherkin
Scenario: Customer cannot reschedule more than 3 times in 7 days
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CONFIRMED"
  And the customer has rescheduled this event 3 times in the last 7 days
  When I POST "/agenda/events/event-abc/reschedule" with new dates
  Then the response status should be 422
  And the response should contain "reschedule limit"
```

---

## 💰 FEATURE: Payment Integration

### Scenario: Event requires payment after confirmation
```gherkin
Scenario: Event requires payment after confirmation
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CONFIRMED"
  When the system marks payment as pending
  Then the event status should be "PAYMENT_PENDING"
  And payment notifications should be sent
  
  When the payment is confirmed
  Then the event status should return to "CONFIRMED"
```

---

## 📸 FEATURE: Work Evidence and Reviews

### Scenario: Artist can add work evidence after completion
```gherkin
Scenario: Artist can add work evidence after completion
  Given I am authenticated as "artist-456"
  And there is an event "event-abc" with status "WAITING_FOR_PHOTOS"
  When I POST "/agenda/events/event-abc/add-photos" with photo data
  Then the response status should be 200
  And the photos should be associated with the event
  And the event status should be "WAITING_FOR_REVIEW"
```

### Scenario: Customer can leave review after session
```gherkin
Scenario: Customer can leave review after session
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "WAITING_FOR_REVIEW"
  When I POST "/agenda/events/event-abc/add-review" with:
    """
    {
      "rating": 5,
      "comment": "Amazing work, very professional!",
      "wouldRecommend": true
    }
    """
  Then the response status should be 200
  And the review should be saved
  And the event status should be "REVIEWED"
  And the artist should receive review notification
```

### Scenario: Customer cannot leave multiple reviews
```gherkin
Scenario: Customer cannot leave multiple reviews
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "REVIEWED"
  And the customer has already left a review
  When I POST "/agenda/events/event-abc/add-review" with new review data
  Then the response status should be 409
  And the response should contain "review already exists"
```

---

## 🚨 FEATURE: Dispute Management

### Scenario: Customer can open dispute during appropriate phases
```gherkin
Scenario: Customer can open dispute during appropriate phases
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "COMPLETED"
  When I POST "/agenda/events/event-abc/open-dispute" with:
    """
    {
      "reason": "Work not as agreed",
      "description": "The tattoo design differs significantly from what was discussed"
    }
    """
  Then the response status should be 200
  And the event status should be "DISPUTE_OPEN"
  And both parties should receive dispute notifications
  And admin should be notified
```

---

## 🔒 FEATURE: Authorization and Security

### Scenario: Unauthorized user cannot access event actions
```gherkin
Scenario: Unauthorized user cannot access event actions
  Given I am not authenticated
  When I GET "/agenda/events/event-abc/actions"
  Then the response status should be 401
```

### Scenario: User cannot access another user's event
```gherkin
Scenario: User cannot access another user's event
  Given I am authenticated as "customer-123"
  And there is an event "event-xyz" belonging to "customer-456"
  When I GET "/agenda/events/event-xyz/actions"
  Then the response status should be 403
```

### Scenario: Customer cannot perform artist-only actions
```gherkin
Scenario: Customer cannot perform artist-only actions
  Given I am authenticated as "customer-123"
  And there is an event "event-abc" with status "CONFIRMED"
  When I POST "/agenda/events/event-abc/start-session"
  Then the response status should be 403
  And the response should contain "insufficient permissions"
```

---

## 📊 FEATURE: Event Actions Matrix Validation

### Scenario Outline: Validate actions per event status and user type
```gherkin
Scenario Outline: Validate actions per event status and user type
  Given I am authenticated as "<userType>"
  And there is an event with status "<eventStatus>"
  And I own this event or it belongs to me
  When I GET "/agenda/events/event-abc/actions"
  Then the response should contain:
    | action              | canPerform   |
    | canEdit             | <canEdit>    |
    | canCancel           | <canCancel>  |
    | canReschedule       | <canReschedule> |
    | canConfirmEvent     | <canConfirm> |
    | canAcceptConsent    | <canAcceptConsent> |
    | canAddWorkEvidence  | <canAddEvidence> |
    | canLeaveReview      | <canReview>  |

Examples:
  | userType | eventStatus         | canEdit | canCancel | canReschedule | canConfirm | canAcceptConsent | canAddEvidence | canReview |
  | CUSTOMER | CREATED            | false   | true      | false         | true       | true             | false          | false     |
  | CUSTOMER | PENDING_CONFIRMATION| false   | true      | false         | true       | true             | false          | false     |
  | CUSTOMER | CONFIRMED          | false   | true      | true          | false      | false            | false          | false     |
  | CUSTOMER | WAITING_FOR_REVIEW | false   | false     | false         | false      | false            | false          | true      |
  | ARTIST   | CREATED            | false   | true      | false         | true       | false            | false          | false     |
  | ARTIST   | CONFIRMED          | true    | true      | true          | false      | false            | false          | false     |
  | ARTIST   | WAITING_FOR_PHOTOS | true    | false     | false         | false      | false            | true           | false     |
```

---

## 🎯 Test Execution Commands

### Setup
```bash
# 1. Run SQL setup script
psql -h localhost -U postgres -d inker_db -f setup-default-consent.sql

# 2. Start application
npm run start:dev

# 3. Seed test data
npm run seed:test-data
```

### Test Categories
```bash
# Run consent tests
npm run test:consent

# Run state machine tests  
npm run test:state-machine

# Run actions engine tests
npm run test:actions

# Run full integration tests
npm run test:integration

# Run all event flow tests
npm run test:event-flow
```

### Expected Test Coverage
- **Unit Tests**: 95%+
- **Integration Tests**: 90%+
- **E2E Tests**: 80%+
- **Business Logic**: 100%

---

## 📋 QA Checklist

### ✅ Pre-Testing Setup
- [ ] Database is running
- [ ] Default consent template is created
- [ ] Test users exist (customer & artist)
- [ ] API server is running
- [ ] Authentication is working

### ✅ Core Functionality
- [ ] Consent acceptance flow works
- [ ] Event state transitions are correct
- [ ] Actions engine returns proper permissions
- [ ] Notifications are sent appropriately
- [ ] Business rules are enforced

### ✅ Edge Cases
- [ ] Duplicate consent handling
- [ ] Invalid event states
- [ ] Unauthorized access attempts
- [ ] Network timeout scenarios
- [ ] Malformed request handling

### ✅ Performance
- [ ] Response times < 500ms
- [ ] Database queries optimized
- [ ] Concurrent user handling
- [ ] Memory leak testing

### ✅ Security
- [ ] JWT validation working
- [ ] Role-based access control
- [ ] Input sanitization
- [ ] SQL injection prevention

---

## 🚀 Automation Implementation

Los scenarios pueden ser implementados usando:
- **Cucumber.js** para JavaScript/TypeScript
- **Jest** para unit testing
- **Supertest** para API testing
- **Playwright** para E2E testing

¡Este README cubre todo el flujo profesional de QA! 🎉 