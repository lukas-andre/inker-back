import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { ReviewReactionEnum } from '../../reactions/domain/enums/reviewReaction.enum';

import { ReviewReactionPipe } from './reviewReactionEnum.pipe';

describe('ReviewReactionPipe', () => {
  let pipe: ReviewReactionPipe;

  beforeEach(() => {
    pipe = new ReviewReactionPipe();
  });

  it('should return the value if it is a valid reaction type', () => {
    const metadata = {
      metatype: String,
      type: 'query',
      data: 'reaction',
    } as ArgumentMetadata;

    expect(pipe.transform('like', metadata)).toBe(ReviewReactionEnum.like);
    expect(pipe.transform('dislike', metadata)).toBe(
      ReviewReactionEnum.dislike,
    );
    expect(pipe.transform('off', metadata)).toBe(ReviewReactionEnum.off);
  });

  it('should throw an error if the value is not a valid reaction type', () => {
    const metadata = {
      metatype: String,
      type: 'query',
      data: 'reaction',
    } as ArgumentMetadata;
    expect(() => pipe.transform('not-valid', metadata)).toThrow(
      BadRequestException,
    );
  });
});
