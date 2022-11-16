import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import {
  AGENDA_EVENT_ID_PIPE_FAILED,
  AGENDA_EVENT_INVALID_ID_TYPE,
  AGENDA_EVENT_NOT_EXISTS,
} from '../../domain/errors/codes';
import { AgendaEventProvider } from '../providers/agendaEvent.provider';

@Injectable()
export class AgendaEventIdPipe
  implements PipeTransform<string, Promise<string | number>>
{
  private readonly logger = new Logger(AgendaEventIdPipe.name);
  constructor(private readonly agendaEventProvider: AgendaEventProvider) {}

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.log({ errors });
      throw new BadRequestException(AGENDA_EVENT_ID_PIPE_FAILED);
    }

    const id = parseInt(value);
    if (!(await this.agendaEventProvider.exists(id))) {
      throw new NotFoundException(AGENDA_EVENT_NOT_EXISTS);
    }

    return id;
  }

  parseInt(val: string) {
    const value = parseInt(val, 10);
    if (isNaN(value)) {
      throw new BadRequestException(AGENDA_EVENT_INVALID_ID_TYPE);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Array, Object];
    return !types.includes(metatype);
  }
}
