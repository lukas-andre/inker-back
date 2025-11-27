# Observability Setup for Inker Backend

This guide explains the OpenTelemetry, Prometheus, and logging setup for the Inker Backend.

## Overview

The observability stack includes:
- **OpenTelemetry**: Distributed tracing and metrics collection
- **Prometheus**: Metrics storage and querying
- **Grafana**: Visualization dashboards
- **Jaeger/Tempo**: Distributed tracing UI
- **Loki**: Log aggregation
- **Pino**: Structured logging with trace correlation

## Quick Start

1. **Start the observability stack:**
   ```bash
   docker-compose -f docker-compose.observability.yml up -d
   ```

2. **Start the application:**
   ```bash
   npm run start:dev
   ```

3. **Access the tools:**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)
   - Jaeger UI: http://localhost:16686
   - Application metrics: http://localhost:8081/metrics

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=inker-backend
OTEL_HOST_METRICS_ENABLED=true
OTEL_API_METRICS_ENABLED=true
OTEL_IGNORE_ROUTES=/health,/metrics
OTEL_PROMETHEUS_PORT=8081
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Logging
LOG_LEVEL=debug
NODE_ENV=development
```

## Features

### 1. Distributed Tracing

Automatic tracing for:
- HTTP requests
- Database queries
- External API calls
- Custom spans

### 2. Metrics

Built-in metrics:
- HTTP request count, duration, and size
- Host metrics (CPU, memory, etc.)
- Custom business metrics

### 3. Structured Logging

- JSON formatted logs
- Automatic trace/span ID injection
- Log correlation with traces

## Usage Examples

### Custom Metrics

```typescript
import { MetricService } from 'nestjs-otel';

@Injectable()
export class MyService {
  private counter: Counter;

  constructor(private metricService: MetricService) {
    this.counter = this.metricService.getCounter('my_custom_counter', {
      description: 'Description of my counter',
    });
  }

  async doSomething() {
    this.counter.add(1, { status: 'success' });
  }
}
```

### Custom Spans

```typescript
import { Span, TraceService } from 'nestjs-otel';

@Injectable()
export class MyService {
  constructor(private traceService: TraceService) {}

  @Span('custom_operation')
  async performOperation(data: any) {
    const span = this.traceService.getSpan();
    span?.setAttributes({ 'data.id': data.id });
    
    // Your logic here
    
    span?.addEvent('operation_completed');
  }
}
```

### Method Decorators

```typescript
import { OtelMethodCounter, OtelInstanceCounter } from 'nestjs-otel';

@Injectable()
@OtelInstanceCounter() // Count instances
export class MyService {
  @OtelMethodCounter() // Count method calls
  async processRequest() {
    // Your logic
  }
}
```

## Example Endpoints

The `/examples/otel` endpoints demonstrate various OpenTelemetry features:

- `GET /examples/otel/health` - Basic health check with metrics
- `POST /examples/otel/process` - Custom metrics example
- `POST /examples/otel/complex-operation` - Multi-span operation
- `GET /examples/otel/generate-load/:count` - Load testing

## Monitoring Queries

### Prometheus Queries

1. **Request rate:**
   ```promql
   rate(http_server_request_count_total[5m])
   ```

2. **Request duration (p95):**
   ```promql
   histogram_quantile(0.95, rate(http_server_duration_bucket[5m]))
   ```

3. **Error rate:**
   ```promql
   rate(http_server_response_error_count_total[5m])
   ```

### Grafana Dashboards

Import these dashboards in Grafana:
1. Node Exporter Full (ID: 1860)
2. NestJS Application Dashboard (custom)

## Troubleshooting

1. **No metrics appearing:**
   - Check if Prometheus endpoint is accessible: `curl http://localhost:8081/metrics`
   - Verify Prometheus scrape config

2. **No traces in Jaeger:**
   - Check Jaeger endpoint configuration
   - Verify OpenTelemetry SDK is started before NestJS

3. **Missing trace IDs in logs:**
   - Ensure PinoInstrumentation is enabled
   - Check log formatter configuration

## Best Practices

1. **Use semantic conventions** for span and metric names
2. **Add meaningful attributes** to spans and metrics
3. **Avoid high-cardinality labels** in metrics
4. **Use appropriate span kinds** (SERVER, CLIENT, INTERNAL)
5. **Handle errors properly** in spans with recordException()
6. **Set sampling rates** appropriately for production

## Performance Considerations

- OpenTelemetry adds minimal overhead (~2-5% in most cases)
- Use sampling in production to reduce data volume
- Consider using batch exporters for better performance
- Monitor the monitoring system itself

## Further Reading

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [NestJS OpenTelemetry Module](https://github.com/pragmaticivan/nestjs-otel)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Tutorials](https://grafana.com/tutorials/)