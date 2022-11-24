import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { DomainUnProcessableEntity } from '../exceptions/domain.exception';

export class TypeTransform {
  static logger = new Logger(TypeTransform.name);
  static async to<T>(cls: ClassConstructor<T>, plain: Object): Promise<T> {
    const newInstance = plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    const errors = await validate(newInstance as Object);
    if (errors.length > 0) {
      TypeTransform.logger.error({ errors });
      throw new InternalServerErrorException('Validation failed');
    }
    return newInstance;
  }

  static async queryResultTo<T>(
    cls: ClassConstructor<T>,
    plain: Object,
  ): Promise<T> {
    const newInstance = plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
    const errors = await validate(newInstance as Object, {
      forbidUnknownValues: true,
    });
    if (errors.length > 0) {
      TypeTransform.logger.error({ errors });
      throw new DomainUnProcessableEntity(
        'Query result schema validation failed',
      );
    }
    return newInstance;
  }
}
