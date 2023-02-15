import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { ReviewReactionEnum } from '../../reactions/domain/enums/reviewReaction.enum';

@Injectable()
export class ReviewReactionPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!ReviewReactionEnum[value]) {
      throw new BadRequestException('Invalid review reaction type');
    }
    return ReviewReactionEnum[value];
  }
}
