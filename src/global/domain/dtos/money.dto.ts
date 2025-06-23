import { IsNumber, IsString } from 'class-validator';

import { MoneyEntity } from '../models/money.model';
import { Transform } from 'class-transformer';

export class MoneyDto extends MoneyEntity {
  @IsNumber()
  amount: number;

  @IsString()
  currency = 'CLP';

  @IsNumber()
  scale: number = 0;
}
