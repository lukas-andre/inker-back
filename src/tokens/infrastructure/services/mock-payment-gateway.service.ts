import { Injectable, Logger } from '@nestjs/common';
import { IPaymentGateway, PaymentRequest, PaymentResult } from '../../domain/interfaces/payment-gateway.interface';

/**
 * Mock Payment Gateway for development and testing
 * 
 * This implementation simulates payment processing without actual charges.
 * It can be configured to simulate various scenarios:
 * - Successful payments
 * - Failed payments (based on specific test card numbers)
 * - Delayed responses
 * - Different payment methods
 */
@Injectable()
export class MockPaymentGatewayService extends IPaymentGateway {
  private readonly logger = new Logger(MockPaymentGatewayService.name);
  private readonly processedPayments = new Map<string, PaymentResult>();

  // Test card numbers for different scenarios
  private readonly TEST_CARDS = {
    SUCCESS: '4242424242424242',
    FAILURE: '4000000000000002',
    INSUFFICIENT_FUNDS: '4000000000009995',
    EXPIRED_CARD: '4000000000000069',
    PROCESSING_ERROR: '4000000000000119',
  };

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    this.logger.log(`[MOCK] Processing payment for amount: ${request.amount} ${request.currency}`);

    // Simulate processing delay
    await this.delay(1000);

    const paymentReference = this.generatePaymentReference();
    const cardNumber = request.paymentData.cardNumber || request.paymentData.paymentMethodId;

    // Simulate different scenarios based on test card
    if (cardNumber === this.TEST_CARDS.FAILURE) {
      const result: PaymentResult = {
        success: false,
        error: 'Card declined',
        errorCode: 'card_declined',
      };
      this.logger.warn(`[MOCK] Payment failed: ${result.error}`);
      return result;
    }

    if (cardNumber === this.TEST_CARDS.INSUFFICIENT_FUNDS) {
      const result: PaymentResult = {
        success: false,
        error: 'Insufficient funds',
        errorCode: 'insufficient_funds',
      };
      this.logger.warn(`[MOCK] Payment failed: ${result.error}`);
      return result;
    }

    if (cardNumber === this.TEST_CARDS.EXPIRED_CARD) {
      const result: PaymentResult = {
        success: false,
        error: 'Card expired',
        errorCode: 'expired_card',
      };
      this.logger.warn(`[MOCK] Payment failed: ${result.error}`);
      return result;
    }

    if (cardNumber === this.TEST_CARDS.PROCESSING_ERROR) {
      const result: PaymentResult = {
        success: false,
        error: 'Processing error. Please try again.',
        errorCode: 'processing_error',
      };
      this.logger.warn(`[MOCK] Payment failed: ${result.error}`);
      return result;
    }

    // Default: successful payment
    const result: PaymentResult = {
      success: true,
      paymentReference,
      paymentMethod: this.detectPaymentMethod(request.paymentData),
      confirmation: {
        id: paymentReference,
        amount: request.amount,
        currency: request.currency,
        status: 'succeeded',
        created: new Date().toISOString(),
        description: request.description,
        metadata: request.metadata,
      },
    };

    // Store for later retrieval
    this.processedPayments.set(paymentReference, result);

    this.logger.log(`[MOCK] Payment successful: ${paymentReference}`);
    return result;
  }

  async refundPayment(paymentReference: string, amount?: number): Promise<PaymentResult> {
    this.logger.log(`[MOCK] Processing refund for payment: ${paymentReference}`);

    await this.delay(800);

    const originalPayment = this.processedPayments.get(paymentReference);
    if (!originalPayment) {
      return {
        success: false,
        error: 'Payment not found',
        errorCode: 'payment_not_found',
      };
    }

    const refundReference = `refund_${this.generatePaymentReference()}`;
    const result: PaymentResult = {
      success: true,
      paymentReference: refundReference,
      confirmation: {
        id: refundReference,
        originalPayment: paymentReference,
        amount: amount || originalPayment.confirmation?.amount,
        status: 'succeeded',
        created: new Date().toISOString(),
      },
    };

    this.logger.log(`[MOCK] Refund successful: ${refundReference}`);
    return result;
  }

  async getPaymentStatus(paymentReference: string): Promise<PaymentResult> {
    this.logger.log(`[MOCK] Getting payment status for: ${paymentReference}`);

    await this.delay(500);

    const payment = this.processedPayments.get(paymentReference);
    if (!payment) {
      return {
        success: false,
        error: 'Payment not found',
        errorCode: 'payment_not_found',
      };
    }

    return payment;
  }

  private generatePaymentReference(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `mock_${timestamp}_${randomPart}`;
  }

  private detectPaymentMethod(paymentData: Record<string, any>): string {
    if (paymentData.cardNumber || paymentData.paymentMethodId?.startsWith('pm_')) {
      const lastFour = paymentData.cardNumber?.slice(-4) || '****';
      return `card_****${lastFour}`;
    }
    if (paymentData.bankAccount) {
      return 'bank_transfer';
    }
    if (paymentData.walletType) {
      return `wallet_${paymentData.walletType}`;
    }
    return 'unknown';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}