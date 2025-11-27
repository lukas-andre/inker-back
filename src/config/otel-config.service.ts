import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenTelemetryModuleOptions, OpenTelemetryOptionsFactory } from 'nestjs-otel/lib/interfaces';


@Injectable()
export class OtelConfigService implements OpenTelemetryOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createOpenTelemetryOptions():
    | Promise<OpenTelemetryModuleOptions>
    | OpenTelemetryModuleOptions {
    const hostMetrics = this.configService.get<boolean>(
      'otel.metrics.hostMetrics',
    );
    const apiMetrics = this.configService.get('otel.metrics.apiMetrics');

    return {
      metrics: {
        hostMetrics,
        apiMetrics: {
          enable: apiMetrics.enabled,
          defaultAttributes: {
            service: this.configService.get('otel.serviceName'),
            environment: this.configService.get('otel.environment'),
          },
          ignoreRoutes: apiMetrics.ignoreRoutes,
          ignoreUndefinedRoutes: apiMetrics.ignoreUndefinedRoutes,
        },
      },
    };
  }
}