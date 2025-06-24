# Payment Gateway Integration Requirements

## Overview

The token system requires integration with a payment gateway to process real payments. This document outlines the requirements and considerations for implementing a production payment gateway.

## Interface Requirements

Any payment gateway implementation must extend the `IPaymentGateway` abstract class:

```typescript
export abstract class IPaymentGateway {
  abstract processPayment(request: PaymentRequest): Promise<PaymentResult>;
  abstract refundPayment(paymentReference: string, amount?: number): Promise<PaymentResult>;
  abstract getPaymentStatus(paymentReference: string): Promise<PaymentResult>;
}
```

## Recommended Payment Gateways

### 1. Stripe (Recommended)
- **Pros**: Excellent developer experience, comprehensive documentation, global coverage
- **Cons**: Higher fees in some regions
- **Integration complexity**: Medium
- **Required credentials**:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`

### 2. PayPal
- **Pros**: Wide user adoption, trusted brand
- **Cons**: Complex API, higher dispute rates
- **Integration complexity**: High
- **Required credentials**:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
  - `PAYPAL_WEBHOOK_ID`

### 3. MercadoPago (Latin America)
- **Pros**: Dominant in LATAM, local payment methods
- **Cons**: Limited to specific regions
- **Integration complexity**: Medium
- **Required credentials**:
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `MERCADOPAGO_PUBLIC_KEY`

## Implementation Example (Stripe)

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IPaymentGateway, PaymentRequest, PaymentResult } from '../../domain/interfaces/payment-gateway.interface';

@Injectable()
export class StripePaymentGatewayService extends IPaymentGateway {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    super();
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2023-10-16' }
    );
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        description: request.description,
        metadata: request.metadata,
        payment_method: request.paymentData.paymentMethodId,
        confirm: true,
        return_url: request.paymentData.returnUrl,
      });

      return {
        success: paymentIntent.status === 'succeeded',
        paymentReference: paymentIntent.id,
        paymentMethod: paymentIntent.payment_method as string,
        confirmation: paymentIntent,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  }

  // ... implement other methods
}
```

## Security Requirements

1. **PCI Compliance**
   - Never store card details directly
   - Use tokenization provided by the payment gateway
   - Implement proper SSL/TLS encryption

2. **Webhook Security**
   - Verify webhook signatures
   - Implement idempotency for webhook handlers
   - Use webhook secrets from environment variables

3. **API Key Management**
   - Store all credentials in environment variables
   - Never commit credentials to version control
   - Use different keys for development/staging/production

## Error Handling

The payment gateway should handle these error scenarios:

1. **Network Errors**: Retry with exponential backoff
2. **Invalid Card**: Return clear error messages
3. **Insufficient Funds**: Return appropriate error code
4. **3D Secure**: Handle additional authentication
5. **Webhooks**: Implement retry logic for failed webhooks

## Testing

1. **Unit Tests**: Mock the payment gateway responses
2. **Integration Tests**: Use sandbox/test environments
3. **E2E Tests**: Use test card numbers provided by the gateway

### Test Card Numbers (Stripe Example)
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Insufficient Funds: `4000000000009995`
- 3D Secure Required: `4000002500003155`

## Compliance Considerations

1. **Data Protection**
   - Comply with GDPR/CCPA for user data
   - Implement proper data retention policies
   - Allow users to request payment data deletion

2. **Financial Regulations**
   - Keep transaction records for tax purposes
   - Implement proper invoicing
   - Handle different tax rates by region

3. **Dispute Handling**
   - Implement chargeback handling
   - Keep detailed transaction logs
   - Provide customer support for payment issues

## Monitoring and Logging

1. **Transaction Monitoring**
   - Log all payment attempts
   - Monitor success/failure rates
   - Set up alerts for unusual patterns

2. **Performance Monitoring**
   - Track API response times
   - Monitor webhook processing times
   - Set up alerts for gateway downtime

## Configuration

Add these environment variables for production:

```env
# Payment Gateway
PAYMENT_GATEWAY_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: Different currencies
PAYMENT_DEFAULT_CURRENCY=USD
PAYMENT_SUPPORTED_CURRENCIES=USD,EUR,GBP,MXN

# Webhook URLs
PAYMENT_WEBHOOK_URL=https://api.yourdomain.com/webhooks/stripe
PAYMENT_SUCCESS_URL=https://app.yourdomain.com/tokens/success
PAYMENT_CANCEL_URL=https://app.yourdomain.com/tokens/cancel
```

## Migration from Mock to Production

1. **Create new service**: Implement the production gateway service
2. **Update module provider**: Change from `MockPaymentGatewayService` to production service
3. **Test in sandbox**: Thoroughly test with sandbox credentials
4. **Gradual rollout**: Use feature flags to control rollout
5. **Monitor closely**: Watch error rates and success metrics

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com/)
- [MercadoPago Developers](https://www.mercadopago.com/developers/)