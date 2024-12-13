import { IsNumber, IsString } from "class-validator";
import { MoneyEntity } from "../models/money.model";

export class MoneyDto extends MoneyEntity {
    @IsNumber()
    amount: number;
  
    @IsString()
    currency: string = 'USD';
  
    @IsNumber()
    scale: number = 2;
  }