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
import { UsersService } from '../../domain/services/users.service';

@Injectable()
export class UserIdPipe
  implements PipeTransform<string, Promise<string | number>>
{
  private readonly logger = new Logger(UserIdPipe.name);
  constructor(private readonly usersService: UsersService) {}

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.log({ errors });
      throw new BadRequestException('Validation failed');
    }

    const userId = parseInt(value);
    if (!(await this.usersService.exists(userId))) {
      throw new NotAcceptableException('User not accepted ');
    }

    return userId;
  }

  parseInt(val: string) {
    const value = parseInt(val, 10);
    if (isNaN(value)) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
