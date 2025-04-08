import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import {
  USER_ID_IS_NOT_VALID,
  USER_NOT_ACCEPTED,
} from '../../domain/errors/codes';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UserIdPipe implements PipeTransform<string, Promise<string>> {
  private readonly logger = new Logger(UserIdPipe.name);
  constructor(private readonly usersRepository: UsersRepository) {}

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.log({ errors });
      throw new BadRequestException(USER_ID_IS_NOT_VALID);
    }

    if (!(await this.usersRepository.exists(value))) {
      throw new NotAcceptableException(USER_NOT_ACCEPTED);
    }

    return value;
  }

  private invalidIdType(metatype: Function): boolean {
    const types: Function[] = [String];
    return !types.includes(metatype);
  }
}
