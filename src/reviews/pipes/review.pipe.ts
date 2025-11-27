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
  REVIEW_ID_PIPE_FAILED,
  REVIEW_INVALID_ID_TYPE,
  REVIEW_NOT_EXISTS,
} from '../codes';
import { ReviewRepository } from '../database/repositories/review.repository';

@Injectable()
export class ReviewIdPipe
  implements PipeTransform<string, Promise<string | number>>
{
  private readonly logger = new Logger(ReviewIdPipe.name);
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async transform(value: string, { metatype }: ArgumentMetadata) {
    if (!metatype || this.invalidIdType(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.log({ errors });
      throw new BadRequestException(REVIEW_ID_PIPE_FAILED);
    }

    if (!(await this.reviewRepository.exists(value))) {
      throw new NotFoundException(REVIEW_NOT_EXISTS);
    }

    return value;
  }

  parseInt(val: string) {
    const value = parseInt(val, 10);
    if (isNaN(value)) {
      throw new BadRequestException(REVIEW_INVALID_ID_TYPE);
    }
    return value;
  }

  private invalidIdType(metatype: Function): boolean {
    const types: Function[] = [String];
    return !types.includes(metatype);
  }
}
