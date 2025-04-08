import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

import { MetaTags } from '../interfaces/metaTags.interface';

export class MetaTagsDto implements MetaTags {
  @IsString()
  @Expose()
  id?: string;

  @IsString()
  @Expose()
  name?: string;
}
