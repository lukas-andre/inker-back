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
import { ArtistRepository } from '../repositories/artist.repository';

@Injectable()
export class ArtistIdPipe implements PipeTransform<string, Promise<string>> {
  private readonly logger = new Logger(ArtistIdPipe.name);
  constructor(private readonly artistProvider: ArtistRepository) {}

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
    }

    if (!(await this.artistProvider.exists(value))) {
      throw new NotAcceptableException(ARTIST_NOT_ACCEPTED);
    }

    return value;
  }

  private invalidIdType(metatype: Function): boolean {
    const types: Function[] = [String];
    return !types.includes(metatype);
  }
}
