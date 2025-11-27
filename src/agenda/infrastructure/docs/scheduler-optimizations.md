# Scheduler View Optimizations

## Overview
This document describes the performance optimizations implemented for the scheduler view endpoint.

## 1. Query Caching

### TypeORM Cache Implementation
- **Agenda lookup**: 5 minutes cache (`agenda_{artistId}`)
- **Events query**: 30 seconds cache (includes date range in key)
- **Direct quotations**: 15 seconds cache (short due to real-time nature)
- **Customer batch lookup**: 1 minute cache (sorted IDs for consistent keys)

### Cache Strategy
- Short TTLs for frequently changing data (quotations, events)
- Longer TTLs for stable data (agenda settings, customer info)
- Cache keys include all query parameters for accuracy

## 2. Database Indexes

### New Composite Indexes Added

#### AgendaEvent Table
- `idx_agenda_event_agenda_dates`: (agenda_id, start_date, end_date)
- `idx_agenda_event_status`: (status)
- `idx_agenda_event_deleted_at`: (deleted_at)
- Composite: (agenda, startDate, status)
- Composite: (status, deletedAt)

#### Quotation Table
- `idx_quotation_type_status`: (type, status)
- `idx_quotation_artist_status`: (artist_id, status)
- `idx_quotation_appointment_date`: (appointment_date)
- Composite: (artistId, status, type)

#### QuotationOffer Table
- `idx_quotation_offer_quotation_artist`: (quotation_id, artist_id)
- `idx_quotation_offer_estimated_date`: (estimated_date)
- `idx_quotation_offer_artist_date`: (artist_id, estimated_date)
- Composite: (quotationId, artistId, estimatedDate)

## 3. Query Optimizations

### Native SQL for Complex Queries
- Open quotations query uses optimized native SQL with JSON aggregation
- Reduces N+1 queries by aggregating offers in single query
- Uses EXISTS clauses for efficient filtering

### Filtering Logic
- Date range filtering applied at database level
- Reduced data transfer by filtering irrelevant quotations
- Optimized JOIN operations with proper indexes

## 4. Best Practices Applied

### Batch Loading
- Customer data loaded in single batch query
- Reduces database round trips

### Selective Data Loading
- Only load necessary relations
- Cache commonly accessed data

### Query Result Limiting
- Filter quotations by date range
- Exclude opportunities without dates for scheduler view

## 5. Migration Script

Run the migration script to create indexes:
```bash
psql -U username -d agenda_db -f src/agenda/infrastructure/migrations/add-scheduler-indexes.sql
```

## 6. Performance Monitoring

### Key Metrics to Track
- Query execution time
- Cache hit rates
- Database connection pool usage
- Memory usage

### Expected Improvements
- 50-70% reduction in query time with indexes
- 80%+ cache hit rate after warm-up
- Reduced database load during peak hours

## 7. Future Optimizations

### Consider for High Load
1. Read replicas for heavy read queries
2. Materialized views for complex aggregations
3. Redis cache for distributed systems
4. GraphQL with DataLoader pattern
5. Pagination for large date ranges

### Maintenance
- Regularly analyze query performance
- Update statistics with ANALYZE command
- Monitor index usage and remove unused ones
- Adjust cache TTLs based on usage patterns