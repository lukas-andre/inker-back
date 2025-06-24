export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  errorCode?: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  customerEmail?: string;
  customerId?: string;
  metadata?: Record<string, any>;
}

export interface IPaymentGateway {
  processPayment(paymentData: PaymentData): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentResult>;
}