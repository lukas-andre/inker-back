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
  ARTIST_ID_PIPE_FAILED,
  ARTIST_INVALID_ID_TYPE,
  ARTIST_NOT_ACCEPTED,
} from '../../domain/errors/codes';
import { ArtistProvider } from '../database/artist.provider';

@Injectable()
export class ArtistIdPipe
  implements PipeTransform<string, Promise<string | number>>
{
  private readonly logger = new Logger(ArtistIdPipe.name);
  constructor(private readonly artistProvider: ArtistProvider) {}

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.log({ errors });
      throw new BadRequestException(ARTIST_ID_PIPE_FAILED);
    }

    const id = this.parseInt(value);
    if (!(await this.artistProvider.exists(id))) {
      throw new NotAcceptableException(ARTIST_NOT_ACCEPTED);
    }

    return id;
  }

  parseInt(val: string) {
    const value = parseInt(val, 10);
    if (isNaN(value)) {
      throw new BadRequestException(ARTIST_INVALID_ID_TYPE);
    }
    return value;
  }

  private invalidIdType(metatype: Function): boolean {
    const types: Function[] = [Number];
    return !types.includes(metatype) || Number.isNaN(metatype);
  }
}
