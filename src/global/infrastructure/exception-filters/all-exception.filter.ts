import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';

import { DomainException } from '../../domain/exceptions/domain.exception';
import { DomainResolver } from '../../domain/resolver/domain.resolver';
import { DbServiceException } from '../exceptions/dbService.exception';
import { HttpResolver } from '../resolver/http.resolver';

export class DtoValidationError {
  error: string;
  statusCode: number;
  message: string[];
}

export function isHttpException(error: any): error is HttpException {
  return error instanceof HttpException;
}

export function isBadRequestException(error: any): boolean {
  return error instanceof BadRequestException;
}

export function isDtoValidationException(
  exception: any,
): exception is DtoValidationError {
  return (
    exception != null &&
    exception.error != null &&
    exception.statusCode != null &&
    exception.message.length > 0
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception instanceof HttpException) {
      const httpStatus = isHttpException(exception)
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

      const error = exception.getResponse();

      if (isBadRequestException(exception) && isDtoValidationException(error)) {
        this.handleDtoValidationException(httpAdapter, ctx, error, httpStatus);
      } else {
        this.handleHttpException(httpStatus, httpAdapter, ctx, exception);
      }
    } else if (exception instanceof DomainException) {
      this.handleDomainException(exception, httpAdapter, ctx);
    } else if (exception instanceof DbServiceException) {
      this.handleDbServiceException(exception, httpAdapter, ctx);
    } else {
      this.handleUnhandledException(exception, httpAdapter, ctx);
    }
  }

  private handleDtoValidationException(
    httpAdapter: AbstractHttpAdapter<any, any, any>,
    ctx: HttpArgumentsHost,
    error: DtoValidationError,
    httpStatus: number,
  ) {
    httpAdapter.reply(ctx.getResponse(), error, httpStatus);
  }

  private handleHttpException(
    httpStatus: number,
    httpAdapter: AbstractHttpAdapter<any, any, any>,
    ctx: HttpArgumentsHost,
    exception: HttpException,
  ) {
    const responseBody = {
      statusCode: httpStatus,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal Server Error',
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private handleDomainException(
    exception: DomainException,
    httpAdapter: AbstractHttpAdapter<any, any, any>,
    ctx: HttpArgumentsHost,
  ) {
    const httpException = HttpResolver.resolve(exception);
    const responseBody = {
      statusCode: httpException.getStatus(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception.response,
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      httpException.getStatus(),
    );
  }

  private handleUnhandledException(
    exception: unknown,
    httpAdapter: AbstractHttpAdapter<any, any, any>,
    ctx: HttpArgumentsHost,
  ) {
    if (exception instanceof Error) {
      Logger.error(exception.stack, 'UnhandledException');
    } else {
      Logger.error(exception, 'UnhandledException');
    }

    const responseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: 'Internal Server Error',
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private handleDbServiceException(
    exception: DbServiceException,
    httpAdapter: AbstractHttpAdapter<any, any, any>,
    ctx: HttpArgumentsHost,
  ) {
    const httpException = HttpResolver.resolve(
      DomainResolver.resolve(exception),
    );
    const responseBody = {
      statusCode: httpException.getStatus(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception.publicError,
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      httpException.getStatus(),
    );
  }
}
