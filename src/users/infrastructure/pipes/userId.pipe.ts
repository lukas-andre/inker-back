import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  PipeTransform,
} from '@nestjs/common';

import {
  USER_NOT_ACCEPTED,
} from '../../domain/errors/codes';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UserIdPipe implements PipeTransform<string, Promise<string>> {
  private readonly logger = new Logger(UserIdPipe.name);
  constructor(private readonly usersRepository: UsersRepository) { }

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
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
