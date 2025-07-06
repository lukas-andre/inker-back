# Redis Configuration Guide

This document explains how Redis is configured in the Inker backend application for different environments.

## Overview

The application uses Redis as the backend for Bull.js queues, which handle asynchronous operations like notifications, PDF generation, and data synchronization. Redis configuration is now centralized and supports password authentication across all environments.

## Configuration

### Environment Variables

The following environment variables control Redis connection:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `REDIS_HOST` | Redis server hostname | `localhost` | `redis_staging` |
| `REDIS_PORT` | Redis server port | `6379` | `6380` |
| `REDIS_PASSWORD` | Redis authentication password | `undefined` | `your-secure-password` |
| `REDIS_RETRY_ATTEMPTS` | Number of connection retry attempts | `10` | `10` |
| `REDIS_RETRY_DELAY` | Delay between retries (ms) | `3000` | `3000` |
| `REDIS_CONNECT_TIMEOUT` | Connection timeout (ms) | `10000` | `10000` |

### Environment-Specific Configuration

#### Local Development
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

#### Staging
```bash
REDIS_HOST=redis_staging
REDIS_PORT=6380
REDIS_PASSWORD=your-staging-password
```

#### Production
```bash
REDIS_HOST=redis_production
REDIS_PORT=6379
REDIS_PASSWORD=your-production-password
```

## Architecture

### Configuration Module

Redis configuration is defined in `src/config/redis.config.ts` using the NestJS configuration pattern:

```typescript
export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  // ... other options
}));
```

### Global Redis Connection

The main Redis connection is configured in `app.module.ts` using `BullModule.forRootAsync`:

```typescript
BullModule.forRootAsync({
  inject: [redisConfig.KEY],
  useFactory: (config: ConfigType<typeof redisConfig>) => ({
    redis: {
      host: config.host,
      port: config.port,
      password: config.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * config.retryDelay, 30000);
        return delay;
      },
      connectTimeout: config.connectTimeout,
    },
  }),
})
```

### Queue Modules

All queue modules (`sync`, `deadletter`, `notification`, `penalty`) inherit the global Redis configuration automatically. They register their queues without specifying Redis connection details:

```typescript
BullModule.registerQueue({
  name: queues.notification.name,
  defaultJobOptions: {
    attempts: 3,
    lifo: false,
  },
})
```

## Queues

The application uses the following queues:

| Queue Name | Purpose | Default Attempts |
|------------|---------|------------------|
| `default` | General purpose queue | 1 |
| `notification` | Email and push notifications | 3 |
| `deadLetter` | Failed job handling | 1 |
| `sync` | Data synchronization | 3 |
| `penaltyProcessing` | No-show penalty processing | 3 |
| `pdfGeneration` | PDF document generation | 1 |

## Security Considerations

1. **Password Protection**: Always use strong passwords in staging and production environments
2. **Network Isolation**: Ensure Redis instances are not publicly accessible
3. **SSL/TLS**: Consider using Redis with SSL/TLS in production (requires additional configuration)
4. **Access Control**: Use Redis ACL features for fine-grained access control

## Docker Support

For local development, you can run Redis using Docker:

```bash
npm run redis
# or manually:
docker run --name inker-redis -p 6379:6379 -d redis
```

For production environments with password:

```bash
docker run --name inker-redis -p 6379:6379 -d redis redis-server --requirepass your-password
```

## Monitoring

Monitor Redis connection health through:
- Application logs for connection errors
- Bull dashboard (if configured)
- Redis CLI or monitoring tools

## Troubleshooting

### Connection Refused
- Verify Redis is running: `redis-cli ping`
- Check host and port configuration
- Ensure firewall rules allow connection

### Authentication Failed
- Verify password is correct
- Check Redis configuration requires authentication
- Ensure password is properly set in environment variables

### High Latency
- Monitor Redis memory usage
- Check network latency between app and Redis
- Consider using Redis Cluster for high load scenarios