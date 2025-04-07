# Content Metrics Integration Guide

This guide explains how to use the `ContentMetricsEnricherService` to add view counts and like counts to content in your use cases.

## What is the ContentMetricsEnricherService?

The `ContentMetricsEnricherService` is a centralized service that adds metrics data (views and likes) to content objects. Instead of implementing this logic in each use case, you can use this service to:

1. Add metrics to single content items
2. Add metrics to arrays of content items
3. Add metrics to paginated responses
4. Add empty metrics placeholders when needed

## Metrics Included

The service adds the following metrics to content:

- `viewCount`: Total number of views for the content
- `likeCount`: Total number of likes for the content
- `userHasLiked`: Boolean indicating if the current user has liked the content (only included if userId is provided)

## How to Use the Service

### 1. Import the necessary types

```typescript
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';
```

### 2. Inject the service in your constructor

```typescript
@Injectable()
export class YourUseCase extends BaseUseCase {
  constructor(
    private readonly contentProvider: YourContentProvider,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(YourUseCase.name);
  }
  
  // ...
}
```

### 3. Update return types to include metrics

```typescript
// For single content items
async execute(params): Promise<(ContentDto & WithMetrics) | null> {
  // implementation
}

// For arrays of content
async execute(params): Promise<(ContentDto & WithMetrics)[]> {
  // implementation
}

// For paginated responses
interface PaginatedResponseWithMetrics<T> extends Omit<PaginatedResponseDto, 'items'> {
  items: (T & WithMetrics)[];
}

async execute(params): Promise<PaginatedResponseWithMetrics<ContentDto>> {
  // implementation
}
```

### 4. Accept userId in your use case parameters

To enable the `userHasLiked` functionality, make sure your use case accepts a userId parameter:

```typescript
async execute(params: { 
  // other parameters 
  userId?: number;
  disableCache?: boolean; // Add this for cache control
}): Promise<(ContentDto & WithMetrics) | null> {
  const { id, userId, disableCache } = params;
  // implementation
}
```

### 5. Use the appropriate enricher method and pass the userId

#### For single content items:

```typescript
const content = await this.contentProvider.findById(id);
if (!content) return null;

const options: MetricsOptions = { disableCache };

return includeMetrics 
  ? await this.metricsEnricher.enrichWithMetrics(content, ContentType.WORK, userId, options)
  : this.metricsEnricher.addEmptyMetrics(content);
```

#### For arrays of content:

```typescript
const contentItems = await this.contentProvider.findAll();

const options: MetricsOptions = { disableCache };

return includeMetrics
  ? await this.metricsEnricher.enrichAllWithMetrics(contentItems, ContentType.STENCIL, userId, options)
  : this.metricsEnricher.addEmptyMetricsToAll(contentItems);
```

#### For paginated responses:

```typescript
const [items, total] = await this.contentProvider.findWithPagination(page, limit);
const pages = Math.ceil(total / limit);

const paginatedResponse = {
  items,
  page,
  limit,
  total,
  pages
};

const options: MetricsOptions = { disableCache };

return includeMetrics
  ? await this.metricsEnricher.enrichPaginatedWithMetrics(paginatedResponse, ContentType.WORK, userId, options)
  : {
      ...paginatedResponse,
      items: this.metricsEnricher.addEmptyMetricsToAll(items)
    };
```

### 6. In controllers or handlers, get the userId from RequestContextService

```typescript
// In your handler
getContentById(id: number, disableCache?: boolean): Promise<ContentDto & WithMetrics> {
  const userId = this.requestContext.userId;
  return this.getContentByIdUseCase.execute({ id, userId, disableCache });
}
```

## Cache Control via HTTP Headers

The service supports disabling caching through HTTP headers. In your controller methods:

```typescript
@Get(':id')
async getContentById(
  @Param('id') id: number,
  @Headers('cache-control') cacheControl?: string
): Promise<ContentDto> {
  const disableCache = cacheControl === 'no-cache';
  return this.contentHandler.getContentById(id, disableCache);
}
```

When clients send the `Cache-Control: no-cache` header, the service will bypass the database cache and fetch fresh metrics data. This is useful for:

1. When users have just liked/unliked content and need to see the updated state
2. In admin panels where real-time metrics data is important
3. When debugging or troubleshooting metrics issues

The metrics cache otherwise expires after 60 seconds to ensure data stays reasonably up-to-date while still providing good performance.

## Content Types

Always use the appropriate `ContentType` enum value:

- `ContentType.WORK` - For tattoo works
- `ContentType.STENCIL` - For stencils
- `ContentType.ARTIST_PROFILE` - For artist profiles

## Adding Support for New Content Types

1. Add the new content type to the `ContentType` enum in `src/analytics/domain/enums/content-types.enum.ts`
2. Ensure the analytics database tables include records for the new content type
3. Use the `ContentMetricsEnricherService` with the new content type

## Performance Considerations

- Metrics are automatically cached for 1 minute
- Cache is automatically invalidated when new interactions are recorded
- For high-volume endpoints, consider making `includeMetrics` optional and default to `false`
- User-specific like status is checked efficiently with batch operations 