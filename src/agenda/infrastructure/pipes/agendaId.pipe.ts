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

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.log({ errors });
      throw new BadRequestException(AGENDA_ID_PIPE_FAILED);
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
