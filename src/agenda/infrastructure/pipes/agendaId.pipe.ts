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
  AGENDA_ID_PIPE_FAILED,
  AGENDA_INVALID_ID_TYPE,
  AGENDA_NOT_EXISTS,
} from '../../domain/errors/codes';
import { AgendaProvider } from '../providers/agenda.provider';

@Injectable()
export class AgendaIdPipe
  implements PipeTransform<string, Promise<string | number>>
{
  private readonly logger = new Logger(AgendaIdPipe.name);
  constructor(private readonly agendaProvider: AgendaProvider) {}

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.log({ errors });
      throw new BadRequestException(AGENDA_ID_PIPE_FAILED);
    }

    const id = this.parseInt(value);
    if (!(await this.agendaProvider.exists(id))) {
      throw new NotAcceptableException(AGENDA_NOT_EXISTS);
    }

    return id;
  }

  parseInt(val: string) {
    const value = parseInt(val, 10);
    if (isNaN(value)) {
      throw new BadRequestException(AGENDA_INVALID_ID_TYPE);
    }
    return value;
  }

  private invalidIdType(metatype: Function): boolean {
    const types: Function[] = [Number];
    return !types.includes(metatype) || Number.isNaN(metatype);
  }
}
