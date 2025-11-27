import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const otelConfig = registerAs('otel', () => ({
  metrics: {
    hostMetrics: process.env.OTEL_HOST_METRICS_ENABLED === 'true' || true,
    apiMetrics: {
      enabled: process.env.OTEL_API_METRICS_ENABLED === 'true' || true,
      ignoreRoutes: process.env.OTEL_IGNORE_ROUTES?.split(',') || ['/health', '/metrics'],
      ignoreUndefinedRoutes: process.env.OTEL_IGNORE_UNDEFINED_ROUTES === 'true' || false,
      prefix: process.env.OTEL_METRICS_PREFIX || 'inker',
    },
  },
  prometheus: {
    port: parseInt(process.env.OTEL_PROMETHEUS_PORT || '8081', 10),
  },
  jaeger: {
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  },
  serviceName: process.env.OTEL_SERVICE_NAME || 'inker-backend',
  environment: process.env.NODE_ENV || 'development',
}));

export const otelConfigSchema = Joi.object({
  OTEL_HOST_METRICS_ENABLED: Joi.boolean().default(true),
  OTEL_API_METRICS_ENABLED: Joi.boolean().default(true),
  OTEL_IGNORE_ROUTES: Joi.string().optional(),
  OTEL_IGNORE_UNDEFINED_ROUTES: Joi.boolean().default(false),
  OTEL_METRICS_PREFIX: Joi.string().default('inker'),
  OTEL_PROMETHEUS_PORT: Joi.number().default(8081),
  JAEGER_ENDPOINT: Joi.string().default('http://localhost:14268/api/traces'),
  OTEL_SERVICE_NAME: Joi.string().default('inker-backend'),
});