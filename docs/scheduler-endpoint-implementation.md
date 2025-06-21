# Scheduler Endpoint Implementation Plan

## Overview

This document outlines the implementation plan for the new `GET /agenda/schedule/{artistId}` endpoint, which provides a combined view of events and quotations for the artist's scheduler interface. This endpoint is designed to power the scheduler UI with all necessary information for appointment management in a single request.

## Business Context

### Understanding the Data Flow

1. **Quotations Lifecycle**:
   - **Direct Quotations (DIRECT)**: Customer → Artist specific request
     - States: PENDING → QUOTED → ACCEPTED/REJECTED/APPEALED
     - When ACCEPTED → Event is created automatically
   - **Open Quotations (OPEN)**: Customer → Multiple artists can offer
     - States: OPEN → ACCEPTED/CANCELED
     - Artists submit offers → Customer accepts one → Event is created

2. **Events Lifecycle**:
   - Created from accepted quotations or directly
   - States flow: CREATED → PENDING_CONFIRMATION → CONFIRMED → IN_PROGRESS → COMPLETED
   - Terminal states: CANCELED, AFTERCARE_PERIOD, DISPUTE_OPEN

### Key Design Decisions

1. **What to Show**:
   - **Events**: Only active events (exclude CANCELED, AFTERCARE_PERIOD, DISPUTE_OPEN)
   - **Quotations**: Only actionable ones:
     - DIRECT: Show QUOTED and APPEALED (artist needs to respond)
     - OPEN: Show only if artist hasn't submitted an offer yet
   - **Important**: Once a quotation is ACCEPTED, show the event instead

2. **Blocking vs Non-Blocking**:
   - **Blocking (confirmed)**: Events in states CONFIRMED, IN_PROGRESS, PAYMENT_PENDING
   - **Non-blocking (tentative)**: 
     - Events in CREATED, PENDING_CONFIRMATION, RESCHEDULED
     - All quotations (they're just proposals)

## Business Requirements

### Minimum Viable Experience (MVE) Requirements

1. **Visual Event Display**
   - Show confirmed appointments as solid blocks on calendar
   - Show tentative appointments with different styling (e.g., striped or semi-transparent)
   - Display quotations as actionable items (not blocking time)
   - Color-code by status and type
   - Show event details on hover/tap

2. **Intuitive Time Selection**
   - Highlight truly available time slots (not blocked by confirmed events)
   - Show conflicts with tentative events as warnings
   - Quick selection from suggested times
   - Duration-aware selection
   - Prevent double-booking of confirmed events only

3. **Quotation Integration**
   - Show quotations that need artist action
   - Display quotation details (customer, description, proposed time)
   - Indicate if quotation time conflicts with existing events
   - Auto-convert accepted quotations to events

4. **Smart Defaults**
   - Consider quotation proposed times as suggestions
   - Show optimal time slots based on schedule density
   - Default to business hours
   - Smart conflict resolution suggestions

## Technical Approach

### Architecture Pattern

Following the established Clean Architecture pattern in the codebase:

```
Controller → Handler → UseCase → Services/Repositories
```

### Key Components

1. **Controller**: `AgendaController` - Add new endpoint
2. **Handler**: `AgendaHandler` - Add new handler method
3. **UseCase**: `GetSchedulerViewUseCase` - New use case for business logic
4. **DTOs**: Request/Response DTOs for the endpoint
5. **Services**: Leverage existing `SchedulingService` for availability calculations

### Data Sources

The endpoint will aggregate data from multiple entities:

1. **AgendaEvent** - Existing appointments/events
2. **Quotation** - Both DIRECT and OPEN quotations
3. **QuotationOffer** - Offers for OPEN quotations
4. **AgendaUnavailableTime** - Artist's blocked time slots
5. **Agenda** - Artist's working hours and settings

## Implementation Steps

### Step 1: Create DTOs

#### Request DTO: `GetSchedulerViewQueryDto`

```typescript
// src/agenda/infrastructure/dtos/getSchedulerViewQuery.dto.ts
export class GetSchedulerViewQueryDto {
  @IsDateString()
  @IsNotEmpty()
  fromDate: string; // ISO date string

  @IsDateString()
  @IsNotEmpty()
  toDate: string; // ISO date string

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeAvailability?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeSuggestions?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(15)
  @Max(480)
  defaultDuration?: number = 60; // For availability calculations
}
```

#### Response DTO: `GetSchedulerViewResDto`

```typescript
// src/agenda/infrastructure/dtos/getSchedulerViewRes.dto.ts
export enum SchedulerItemCategory {
  CONFIRMED = 'confirmed',      // Blocks calendar time
  TENTATIVE = 'tentative',      // Shows but doesn't block
  ACTIONABLE = 'actionable',    // Quotations needing response
  OPPORTUNITY = 'opportunity'    // Open quotations to bid on
}

export interface SchedulerEventDto {
  id: string;
  category: SchedulerItemCategory;
  type: 'event';
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: AgendaEventStatus;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  quotationId?: string;
  isBlocking: boolean; // Explicitly indicate if this blocks the calendar
  canModify: boolean;
  canCancel: boolean;
  canReschedule: boolean;
  conflictsWith?: string[]; // IDs of tentative events this conflicts with
  workEvidence?: MultimediasMetadataInterface;
  notes?: string;
  reminderSent?: Record<string, boolean>;
}

export interface SchedulerQuotationDto {
  id: string;
  category: SchedulerItemCategory;
  type: 'quotation';
  quotationType: QuotationType;
  status: QuotationStatus;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  description: string;
  estimatedCost?: MoneyEntity;
  proposedDate?: Date; // appointmentDate for DIRECT quotations
  proposedDuration?: number; // in minutes
  referenceImages?: MultimediasMetadataInterface;
  hasConflict: boolean; // True if proposed time conflicts with existing events
  conflictingEventIds?: string[]; // IDs of events it conflicts with
  actionRequired: boolean; // True if artist needs to respond
  actionDeadline?: Date; // When response is needed by
  offers?: OpenQuotationOfferDto[]; // For OPEN quotations
  canRespond: boolean;
  canSubmitOffer: boolean; // For OPEN quotations
}

export interface SchedulerSummaryDto {
  totalConfirmedEvents: number;
  totalTentativeEvents: number;
  totalActionableQuotations: number;
  totalOpportunities: number;
  nextAvailableSlot?: TimeSlot;
  upcomingDeadlines: {
    quotationId: string;
    deadline: Date;
    type: 'response' | 'confirmation';
  }[];
}

export class GetSchedulerViewResDto {
  events: SchedulerEventDto[];
  quotations: SchedulerQuotationDto[];
  availability?: AvailabilityCalendar[];
  suggestedSlots?: TimeSlot[];
  workingHours: {
    start: string;
    end: string;
    workingDays: string[];
  };
  summary: SchedulerSummaryDto;
}
```

### Step 2: Create Use Case

```typescript
// src/agenda/usecases/scheduler/getSchedulerView.usecase.ts
@Injectable()
export class GetSchedulerViewUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaRepository: AgendaRepository,
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly quotationProvider: QuotationRepository,
    private readonly quotationOfferRepository: QuotationOfferRepository,
    private readonly schedulingService: SchedulingService,
    private readonly quotationEnrichmentService: QuotationEnrichmentService,
    private readonly eventActionEngineService: EventActionEngineService,
  ) {
    super(GetSchedulerViewUseCase.name);
  }

  async execute(
    artistId: string,
    query: GetSchedulerViewQueryDto,
  ): Promise<GetSchedulerViewResDto> {
    // Implementation details in Step 3
  }
}
```

### Step 3: Implement Business Logic

#### 3.1 Fetch Artist's Agenda

```typescript
const agenda = await this.agendaRepository.findOne({
  where: { artistId },
});

if (!agenda) {
  throw new NotFoundException(`Artist ${artistId} does not have an agenda`);
}
```

#### 3.2 Fetch Events in Date Range

```typescript
// Define which states are considered "active" for the scheduler
const ACTIVE_EVENT_STATES = [
  AgendaEventStatus.CREATED,
  AgendaEventStatus.PENDING_CONFIRMATION,
  AgendaEventStatus.CONFIRMED,
  AgendaEventStatus.IN_PROGRESS,
  AgendaEventStatus.PAYMENT_PENDING,
  AgendaEventStatus.RESCHEDULED,
  AgendaEventStatus.COMPLETED,
  AgendaEventStatus.WAITING_FOR_PHOTOS,
  AgendaEventStatus.WAITING_FOR_REVIEW,
];

// Define which states block calendar time
const BLOCKING_EVENT_STATES = [
  AgendaEventStatus.CONFIRMED,
  AgendaEventStatus.IN_PROGRESS,
  AgendaEventStatus.PAYMENT_PENDING,
];

const events = await this.agendaEventRepository.find({
  where: {
    agenda: { id: agenda.id },
    startDate: Between(new Date(query.fromDate), new Date(query.toDate)),
    status: In(ACTIVE_EVENT_STATES),
    deletedAt: IsNull(),
  },
  relations: ['agenda'],
  order: { startDate: 'ASC' },
});
```

#### 3.3 Fetch Relevant Quotations

```typescript
// For DIRECT quotations: only show QUOTED and APPEALED (need artist response)
const directQuotations = await this.quotationProvider.find({
  where: {
    artistId,
    status: In([QuotationStatus.QUOTED, QuotationStatus.APPEALED]),
    type: QuotationType.DIRECT,
  },
});

// For OPEN quotations: only show if artist hasn't submitted an offer yet
const openQuotations = await this.quotationProvider.find({
  where: {
    type: QuotationType.OPEN,
    status: QuotationStatus.OPEN,
    // Filter by location/radius if needed
  },
  relations: ['offers'],
});

// Filter out quotations where this artist already submitted an offer
const openOpportunities = openQuotations.filter(q => 
  !q.offers?.some(o => o.artistId === artistId)
);

// Combine all relevant quotations
const allQuotations = [...directQuotations, ...openOpportunities];
```

#### 3.4 Enrich and Transform Data

```typescript
// Get customer data for all events and quotations
const customerIds = new Set([
  ...events.map(e => e.customerId).filter(Boolean),
  ...allQuotations.map(q => q.customerId).filter(Boolean),
]);
const customers = await this.customerRepository.findByIds([...customerIds]);
const customerMap = new Map(customers.map(c => [c.id, c]));

// Helper function to categorize events
const categorizeEvent = (status: AgendaEventStatus): SchedulerItemCategory => {
  if (BLOCKING_EVENT_STATES.includes(status)) {
    return SchedulerItemCategory.CONFIRMED;
  }
  return SchedulerItemCategory.TENTATIVE;
};

// Transform events to SchedulerEventDto
const schedulerEvents = await Promise.all(events.map(async (event) => {
  const customer = customerMap.get(event.customerId);
  const actionContext = {
    userId: artistId,
    userType: 'artist' as const,
    event,
  };
  
  const actions = await this.eventActionEngineService.getAvailableActions(actionContext);
  const isBlocking = BLOCKING_EVENT_STATES.includes(event.status);
  
  // Find conflicts with tentative events
  const conflictsWith = events
    .filter(e => 
      e.id !== event.id &&
      !BLOCKING_EVENT_STATES.includes(e.status) &&
      this.hasTimeOverlap(event, e)
    )
    .map(e => e.id);
  
  return {
    id: event.id,
    category: categorizeEvent(event.status),
    type: 'event' as const,
    title: event.title,
    description: event.info,
    startDate: event.startDate,
    endDate: event.endDate,
    status: event.status,
    customerId: event.customerId,
    customerName: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Unknown',
    customerAvatar: customer?.avatarUrl,
    quotationId: event.quotationId,
    isBlocking,
    canModify: actions.canEdit,
    canCancel: actions.canCancel,
    canReschedule: actions.canReschedule,
    conflictsWith: conflictsWith.length > 0 ? conflictsWith : undefined,
    workEvidence: event.workEvidence,
    notes: event.notes,
    reminderSent: event.reminderSent,
  };
}));

// Transform quotations to SchedulerQuotationDto
const schedulerQuotations = await Promise.all(allQuotations.map(async (quotation) => {
  const customer = customerMap.get(quotation.customerId);
  const isDirectQuotation = quotation.type === QuotationType.DIRECT;
  const isOpenQuotation = quotation.type === QuotationType.OPEN;
  
  // Check for conflicts with existing events
  let hasConflict = false;
  let conflictingEventIds: string[] = [];
  
  if (quotation.appointmentDate && quotation.appointmentDuration) {
    const quotationEnd = new Date(quotation.appointmentDate);
    quotationEnd.setMinutes(quotationEnd.getMinutes() + quotation.appointmentDuration);
    
    conflictingEventIds = events
      .filter(e => {
        const overlap = this.hasTimeOverlap(
          { startDate: quotation.appointmentDate, endDate: quotationEnd },
          e
        );
        if (overlap && BLOCKING_EVENT_STATES.includes(e.status)) {
          hasConflict = true;
        }
        return overlap;
      })
      .map(e => e.id);
  }
  
  // Determine category
  let category: SchedulerItemCategory;
  if (isDirectQuotation && [QuotationStatus.QUOTED, QuotationStatus.APPEALED].includes(quotation.status)) {
    category = SchedulerItemCategory.ACTIONABLE;
  } else if (isOpenQuotation) {
    category = SchedulerItemCategory.OPPORTUNITY;
  } else {
    category = SchedulerItemCategory.TENTATIVE; // Shouldn't happen with our filters
  }
  
  return {
    id: quotation.id,
    category,
    type: 'quotation' as const,
    quotationType: quotation.type,
    status: quotation.status,
    customerId: quotation.customerId,
    customerName: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Unknown',
    customerAvatar: customer?.avatarUrl,
    description: quotation.description,
    estimatedCost: quotation.estimatedCost,
    proposedDate: quotation.appointmentDate,
    proposedDuration: quotation.appointmentDuration,
    referenceImages: quotation.referenceImages,
    hasConflict,
    conflictingEventIds: conflictingEventIds.length > 0 ? conflictingEventIds : undefined,
    actionRequired: isDirectQuotation,
    actionDeadline: this.calculateActionDeadline(quotation),
    offers: quotation.offers,
    canRespond: isDirectQuotation,
    canSubmitOffer: isOpenQuotation,
  };
}));
```

#### 3.5 Calculate Availability (Optional)

```typescript
let availability: AvailabilityCalendar[] = [];
let suggestedSlots: TimeSlot[] = [];

if (query.includeAvailability) {
  // Calculate availability considering only BLOCKING events
  const blockingEvents = events.filter(e => BLOCKING_EVENT_STATES.includes(e.status));
  
  availability = await this.schedulingService.findAvailableSlots(
    artistId,
    query.defaultDuration,
    new Date(query.fromDate),
    new Date(query.toDate),
  );
}

if (query.includeSuggestions) {
  // Get smart suggestions considering quotation proposed times
  const quotationProposedTimes = allQuotations
    .filter(q => q.appointmentDate && !hasConflict)
    .map(q => ({
      startTime: q.appointmentDate,
      endTime: new Date(new Date(q.appointmentDate).getTime() + (q.appointmentDuration || 60) * 60000),
      density: -1, // Negative density to prioritize these slots
    }));
  
  suggestedSlots = await this.schedulingService.suggestOptimalTimes(
    artistId,
    query.defaultDuration,
    8, // Number of suggestions
  );
  
  // Merge quotation proposed times with suggestions
  if (quotationProposedTimes.length > 0) {
    suggestedSlots = [...quotationProposedTimes, ...suggestedSlots]
      .sort((a, b) => (a.density || 0) - (b.density || 0))
      .slice(0, 8);
  }
}
```

#### 3.6 Generate Summary

```typescript
// Calculate summary statistics
const summary: SchedulerSummaryDto = {
  totalConfirmedEvents: schedulerEvents.filter(e => e.category === SchedulerItemCategory.CONFIRMED).length,
  totalTentativeEvents: schedulerEvents.filter(e => e.category === SchedulerItemCategory.TENTATIVE).length,
  totalActionableQuotations: schedulerQuotations.filter(q => q.category === SchedulerItemCategory.ACTIONABLE).length,
  totalOpportunities: schedulerQuotations.filter(q => q.category === SchedulerItemCategory.OPPORTUNITY).length,
  nextAvailableSlot: suggestedSlots[0],
  upcomingDeadlines: schedulerQuotations
    .filter(q => q.actionDeadline)
    .map(q => ({
      quotationId: q.id,
      deadline: q.actionDeadline!,
      type: 'response' as const,
    }))
    .concat(
      schedulerEvents
        .filter(e => e.status === AgendaEventStatus.PENDING_CONFIRMATION)
        .map(e => ({
          quotationId: e.id,
          deadline: new Date(e.startDate.getTime() - 24 * 60 * 60 * 1000), // 24h before
          type: 'confirmation' as const,
        }))
    )
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5), // Top 5 upcoming deadlines
};

// Return the complete response
return {
  events: schedulerEvents,
  quotations: schedulerQuotations,
  availability,
  suggestedSlots,
  workingHours: {
    start: agenda.workingHoursStart || '09:00',
    end: agenda.workingHoursEnd || '18:00',
    workingDays: agenda.workingDays || ['1', '2', '3', '4', '5'],
  },
  summary,
};
```

### Step 4: Update Handler

```typescript
// src/agenda/infrastructure/agenda.handler.ts
async handleGetSchedulerView(
  artistId: string,
  query: GetSchedulerViewQueryDto,
): Promise<GetSchedulerViewResDto> {
  return this.getSchedulerViewUseCase.execute(artistId, query);
}
```

### Step 5: Update Controller

```typescript
// src/agenda/infrastructure/controllers/agenda.controller.ts
@ApiOperation({ 
  summary: 'Get combined scheduler view with events and quotations',
  description: 'Returns all events and quotations for an artist within a date range, optimized for scheduler UI'
})
@ApiOkResponse({ 
  description: 'Scheduler data retrieved successfully',
  type: GetSchedulerViewResDto 
})
@ApiParam({ name: 'artistId', required: true, type: String })
@Get('schedule/:artistId')
@CacheTTL(10) // Cache for 10 seconds
async getSchedulerView(
  @Param('artistId') artistId: string,
  @Query() query: GetSchedulerViewQueryDto,
): Promise<GetSchedulerViewResDto> {
  return this.agendaHandler.handleGetSchedulerView(artistId, query);
}
```

### Step 6: Update Module Dependencies

```typescript
// src/agenda/agenda.module.ts
// Add new use case to providers
providers: [
  // ... existing providers
  GetSchedulerViewUseCase,
]
```

### Step 7: Add Helper Methods

```typescript
// Helper method to check time overlap between two time ranges
private hasTimeOverlap(
  range1: { startDate: Date; endDate: Date },
  range2: { startDate: Date; endDate: Date }
): boolean {
  const start1 = new Date(range1.startDate).getTime();
  const end1 = new Date(range1.endDate).getTime();
  const start2 = new Date(range2.startDate).getTime();
  const end2 = new Date(range2.endDate).getTime();
  
  return start1 < end2 && start2 < end1;
}

// Helper method to calculate action deadline for quotations
private calculateActionDeadline(quotation: Quotation): Date | undefined {
  if (quotation.type === QuotationType.DIRECT && quotation.createdAt) {
    // For direct quotations, assume 48-hour response time
    const deadline = new Date(quotation.createdAt);
    deadline.setHours(deadline.getHours() + 48);
    return deadline;
  }
  
  if (quotation.appointmentDate) {
    // If there's a proposed date, deadline is 24 hours before
    const deadline = new Date(quotation.appointmentDate);
    deadline.setHours(deadline.getHours() - 24);
    return deadline;
  }
  
  return undefined;
}

// Helper method to batch fetch customer data
private async getCustomersMap(customerIds: string[]): Promise<Map<string, CustomerDto>> {
  if (customerIds.length === 0) return new Map();
  
  const customers = await this.customerRepository.find({
    where: { id: In(customerIds) },
  });
  
  return new Map(customers.map(c => [c.id, c]));
}
```

## Testing Strategy

### Unit Tests

1. **GetSchedulerViewUseCase Tests**
   - Test with various date ranges
   - Test with different quotation states
   - Test availability calculation toggle
   - Test error cases (artist not found, invalid dates)

2. **DTO Validation Tests**
   - Test date format validation
   - Test optional parameter defaults

### Integration Tests

1. **Full Flow Test**
   - Create test data (events, quotations, offers)
   - Call endpoint and verify response structure
   - Test caching behavior

### E2E Tests

1. **API Endpoint Tests**
   - Test authentication/authorization
   - Test response format
   - Test performance with large datasets

## Performance Considerations

1. **Query Optimization**
   - Use database indexes on date fields
   - Implement pagination for large date ranges
   - Use selective field loading

2. **Caching Strategy**
   - Cache response for 10-20 seconds
   - Invalidate cache on event/quotation updates
   - Consider Redis for distributed caching

3. **Data Loading**
   - Use batch loading for customer/artist data
   - Implement DataLoader pattern if N+1 queries become an issue
   - Consider GraphQL for flexible field selection

## Security Considerations

1. **Authorization**
   - Verify authenticated user has permission to view artist's schedule
   - Consider role-based access (artist, admin, assistant)

2. **Data Privacy**
   - Filter sensitive customer information based on viewer role
   - Mask financial data if viewer is not the artist

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live schedule updates
   - Push notifications for new quotations/changes

2. **Advanced Filtering**
   - Filter by event status
   - Filter by customer
   - Search functionality

3. **Bulk Operations**
   - Batch accept/reject quotations
   - Bulk reschedule events

4. **AI-Powered Suggestions**
   - Smart scheduling based on artist preferences
   - Automatic conflict resolution
   - Optimal schedule generation

## Migration Notes

- No database migrations required
- Fully backward compatible
- Can be deployed independently

## Monitoring

1. **Metrics to Track**
   - Endpoint response time
   - Cache hit rate
   - Number of events/quotations returned
   - Error rates

2. **Alerts**
   - Response time > 2 seconds
   - Error rate > 1%
   - Cache failures

## Documentation

1. **API Documentation**
   - Update Swagger/OpenAPI spec
   - Add example responses
   - Document rate limits

2. **Developer Guide**
   - Usage examples
   - Integration guide for frontend
   - Troubleshooting guide

## Example Response

```json
{
  "events": [
    {
      "id": "event-123",
      "category": "confirmed",
      "type": "event",
      "title": "Dragon Tattoo Session",
      "description": "Full back dragon design",
      "startDate": "2024-01-15T14:00:00Z",
      "endDate": "2024-01-15T18:00:00Z",
      "status": "confirmed",
      "customerId": "customer-456",
      "customerName": "John Doe",
      "customerAvatar": "https://...",
      "quotationId": "quotation-789",
      "isBlocking": true,
      "canModify": true,
      "canCancel": true,
      "canReschedule": true,
      "notes": "Customer prefers black ink only"
    },
    {
      "id": "event-124",
      "category": "tentative",
      "type": "event",
      "title": "Consultation - Sleeve Design",
      "description": "Initial consultation for sleeve",
      "startDate": "2024-01-16T10:00:00Z",
      "endDate": "2024-01-16T11:00:00Z",
      "status": "pending_confirmation",
      "customerId": "customer-457",
      "customerName": "Jane Smith",
      "isBlocking": false,
      "canModify": true,
      "canCancel": true,
      "conflictsWith": ["event-125"]
    }
  ],
  "quotations": [
    {
      "id": "quotation-790",
      "category": "actionable",
      "type": "quotation",
      "quotationType": "DIRECT",
      "status": "quoted",
      "customerId": "customer-458",
      "customerName": "Bob Wilson",
      "description": "Small butterfly tattoo on wrist",
      "estimatedCost": {
        "amount": 150,
        "currency": "USD"
      },
      "proposedDate": "2024-01-17T15:00:00Z",
      "proposedDuration": 60,
      "hasConflict": false,
      "actionRequired": true,
      "actionDeadline": "2024-01-14T12:00:00Z",
      "canRespond": true
    },
    {
      "id": "quotation-791",
      "category": "opportunity",
      "type": "quotation",
      "quotationType": "OPEN",
      "status": "open",
      "customerId": "customer-459",
      "customerName": "Alice Brown",
      "description": "Geometric pattern on forearm",
      "hasConflict": false,
      "actionRequired": false,
      "canSubmitOffer": true
    }
  ],
  "availability": [
    {
      "date": "2024-01-15",
      "slots": [
        {
          "startTime": "2024-01-15T09:00:00Z",
          "endTime": "2024-01-15T10:00:00Z",
          "density": 0.5
        },
        {
          "startTime": "2024-01-15T10:00:00Z",
          "endTime": "2024-01-15T11:00:00Z",
          "density": 0.3
        }
      ]
    }
  ],
  "suggestedSlots": [
    {
      "startTime": "2024-01-17T15:00:00Z",
      "endTime": "2024-01-17T16:00:00Z",
      "density": -1
    },
    {
      "startTime": "2024-01-16T14:00:00Z",
      "endTime": "2024-01-16T15:00:00Z",
      "density": 0.2
    }
  ],
  "workingHours": {
    "start": "09:00",
    "end": "18:00",
    "workingDays": ["1", "2", "3", "4", "5"]
  },
  "summary": {
    "totalConfirmedEvents": 1,
    "totalTentativeEvents": 1,
    "totalActionableQuotations": 1,
    "totalOpportunities": 1,
    "nextAvailableSlot": {
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T10:00:00Z"
    },
    "upcomingDeadlines": [
      {
        "quotationId": "quotation-790",
        "deadline": "2024-01-14T12:00:00Z",
        "type": "response"
      },
      {
        "quotationId": "event-124",
        "deadline": "2024-01-15T10:00:00Z",
        "type": "confirmation"
      }
    ]
  }
}
```

## Frontend Integration Guidelines

### Calendar Display

1. **Event Rendering**:
   - Use `isBlocking` to determine if event should block time slots
   - Apply different visual styles based on `category`:
     - `confirmed`: Solid color blocks
     - `tentative`: Striped or semi-transparent
   - Show conflict indicators for events with `conflictsWith`

2. **Quotation Display**:
   - Show as cards or list items, not on calendar grid
   - Highlight `actionRequired` quotations
   - Display countdown for `actionDeadline`
   - Show conflict warnings if `hasConflict` is true

3. **Availability**:
   - Overlay available slots on calendar
   - Use `density` to show optimal times (lower is better)
   - Highlight suggested slots from quotations

### User Actions

1. **For Events**:
   - Enable/disable actions based on `canModify`, `canCancel`, `canReschedule`
   - Show appropriate status transitions based on current `status`

2. **For Quotations**:
   - Show "Respond" button if `canRespond` is true
   - Show "Submit Offer" if `canSubmitOffer` is true
   - Display proposed time with conflict warnings

3. **Quick Actions**:
   - Use `summary.upcomingDeadlines` for urgent action reminders
   - Quick-create event from accepted quotations
   - One-click accept for quotation proposed times