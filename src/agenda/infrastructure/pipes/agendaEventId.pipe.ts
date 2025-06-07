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
import { AgendaEventRepository } from '../repositories/agendaEvent.repository';

@Injectable()
export class AgendaEventIdPipe
  implements PipeTransform<string, Promise<string>> {
  private readonly logger = new Logger(AgendaEventIdPipe.name);
  constructor(private readonly agendaEventRepository: AgendaEventRepository) { }

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
    }

    if (!(await this.agendaEventRepository.exists(value))) {
      throw new NotFoundException(AGENDA_EVENT_NOT_EXISTS);
    }

    return value;
  }

  private invalidIdType(metatype: Function): boolean {
    const types: Function[] = [String];
    return !types.includes(metatype);
  }
}
