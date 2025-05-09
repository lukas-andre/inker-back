import { MoneyInterface } from '../interfaces/money.interface';

export class MoneyEntity implements MoneyInterface {
  amount: number;
  currency: string;
  scale: number;

  constructor(amount?: number, currency: string = 'CLP', scale: number = 1) {
    this.amount = amount || 0;
    this.currency = currency;
    this.scale = scale;
  }

  static fromFloat(
    amount: number,
    currency: string = 'CLP',
    scale: number = 1,
  ): MoneyEntity {
    return new MoneyEntity(
      Math.round(amount * Math.pow(10, scale)),
      currency,
      scale,
    );
  }

  static fromJson(json: any): MoneyEntity {
    if (!json) return null;
    return new MoneyEntity(json.amount, json.currency, json.scale);
  }

  toFloat(): number {
    return this.amount / Math.pow(10, this.scale);
  }

  toString(): string {
    return `${this.toFloat().toFixed(this.scale)} ${this.currency}`;
  }

  toJSON(): any {
    return {
      amount: this.amount,
      currency: this.currency,
      scale: this.scale,
    };
  }
}
