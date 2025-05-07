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
  AGENDA_NOT_EXISTS,
} from '../../domain/errors/codes';
import { AgendaRepository } from '../repositories/agenda.repository';

@Injectable()
export class AgendaIdPipe
  implements PipeTransform<string, Promise<string | number>> {
  private readonly logger = new Logger(AgendaIdPipe.name);
  constructor(private readonly agendaRepository: AgendaRepository) { }

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
    }


    if (!(await this.agendaRepository.exists(value))) {
      throw new NotAcceptableException(AGENDA_NOT_EXISTS);
    }

    return value;
  }


  private invalidIdType(metatype: Function): boolean {
    const types: Function[] = [String];
    return !types.includes(metatype);
  }
}
