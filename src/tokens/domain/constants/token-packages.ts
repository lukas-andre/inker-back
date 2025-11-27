export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  pricePerToken: number;
  savings: number;
  description: string;
  badge?: string;
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Paquete Inicial',
    tokens: 10,
    price: 5.00,
    currency: 'USD',
    pricePerToken: 0.50,
    savings: 0,
    description: 'Perfecto para probar el servicio'
  },
  {
    id: 'popular',
    name: 'Paquete Popular',
    tokens: 25,
    price: 10.00,
    currency: 'USD',
    pricePerToken: 0.40,
    savings: 20,
    badge: 'MÁS POPULAR',
    description: 'Ideal para usuarios regulares'
  },
  {
    id: 'pro',
    name: 'Paquete Pro',
    tokens: 60,
    price: 20.00,
    currency: 'USD',
    pricePerToken: 0.33,
    savings: 33,
    description: 'Para diseñadores frecuentes'
  },
  {
    id: 'enterprise',
    name: 'Paquete Empresa',
    tokens: 150,
    price: 40.00,
    currency: 'USD',
    pricePerToken: 0.27,
    savings: 47,
    description: 'Mejor valor para uso intensivo'
  }
];

export const PRICING_CONFIG = {
  runwareCostPerImage: 0.06,      // Costo real de Runware
  minProfitMargin: 5.0,           // Margen mínimo 5x
  targetProfitMargin: 8.3,        // Margen objetivo 8.3x
  welcomeTokens: 3,               // Tokens gratis al registrarse
  referralTokens: 2,              // Tokens por referir a un amigo
  monthlyFreeTokens: 0,           // Sin tokens mensuales gratis en MVP
};