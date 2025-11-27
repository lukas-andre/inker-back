import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const isProduction = true;
        
        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l',
                  },
                },
            autoLogging: {
              ignore: (req) => {
                const ignorePaths = ['/health', '/metrics'];
                return ignorePaths.includes(req.url);
              },
            },
            customProps: (req, res) => ({
              context: 'HTTP',
              userAgent: req.headers['user-agent'],
            }),
            serializers: {
              req: (req) => ({
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                headers: {
                  'user-agent': req.headers['user-agent'],
                  'content-type': req.headers['content-type'],
                },
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },
            formatters: {
              log: (object) => {
                const span = trace.getSpan(context.active());
                if (!span) return { ...object };
                const { spanId, traceId } = span.spanContext();
                return { ...object, spanId, traceId };
              },
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [LoggerModule],
})
export class AppLoggerModule {}