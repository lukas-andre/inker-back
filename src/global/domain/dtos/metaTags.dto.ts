import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

import { MetaTags } from '../interfaces/metaTags.interface';

export class MetaTagsDto implements MetaTags {
  @IsNumber()
  @Expose()
  id?: number;

  @IsString()
  @Expose()
  name?: string;
}
