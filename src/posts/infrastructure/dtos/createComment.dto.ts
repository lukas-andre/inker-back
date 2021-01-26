import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ParentCommentEnum } from '../enum/parentComment.enum';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Post Content',
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    description: 'Post user location',
  })
  @IsString()
  readonly location: string;

  @ApiProperty({
    description: 'Comment parent type',
    example: ParentCommentEnum.POST,
    enum: ParentCommentEnum,
  })
  @IsEnum(ParentCommentEnum)
  @Transform(value => ParentCommentEnum[value])
  readonly parentType: ParentCommentEnum;

  @ApiProperty({
    description: 'Post user profile thumnail',
    type: Number,
  })
  @IsNumber()
  readonly parentId: number;
}
