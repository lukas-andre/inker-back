export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  paymentData: Record<string, any>; // Gateway-specific payment data
}

export interface PaymentResult {
  success: boolean;
  paymentReference?: string;
  paymentMethod?: string;
  confirmation?: any;
  error?: string;
  errorCode?: string;
}

export abstract class IPaymentGateway {
  abstract processPayment(request: PaymentRequest): Promise<PaymentResult>;
  abstract refundPayment(paymentReference: string, amount?: number): Promise<PaymentResult>;
  abstract getPaymentStatus(paymentReference: string): Promise<PaymentResult>;
}