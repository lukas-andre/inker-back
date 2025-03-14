import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JobTypeKey, JobTypeSchemaRegistry } from '../../queues/notifications/domain/jobSchema.registry';

export class NotificationQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ 
    required: false, 
    enum: ['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_CANCELED', 'EVENT_STATUS_CHANGED'],
    example: 'EVENT_STATUS_CHANGED'
  })
  @IsEnum(JobTypeSchemaRegistry, { each: true })
  @IsOptional()
  type?: JobTypeKey;
}