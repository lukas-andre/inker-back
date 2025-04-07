export interface MoneyInterface {
  amount: number; // Stored as minor units (cents, centavos, etc)
  currency: string; // ISO 4217 currency code (USD, EUR, etc)
  scale: number; // Number of decimal places (usually 2)
}
