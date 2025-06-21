import { IsNumber, IsString } from 'class-validator';

import { MoneyEntity } from '../models/money.model';

export class MoneyDto extends MoneyEntity {
  @IsNumber()
  amount: number;

  @IsString()
  currency = 'CLP';

  @IsNumber()
  scale = 0;
}
