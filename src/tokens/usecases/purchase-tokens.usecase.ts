import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { BaseUseCase, UseCase } from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { TokenBalance } from '../infrastructure/entities/token-balance.entity';
import { TOKEN_PURCHASE_CONFIRMATION } from '../../queues/notifications/domain/schemas/tokens';
import { TokenBalanceRepository } from '../infrastructure/repositories/token-balance.repository';
import { TokenTransactionRepository } from '../infrastructure/repositories/token-transaction.repository';
import { TransactionType } from '../domain/enums/transaction-type.enum';
import { TransactionStatus } from '../domain/enums/transaction-status.enum';
import { IPaymentGateway } from '../domain/interfaces/payment-gateway.interface';
import { TokenPackageService } from '../infrastructure/services/token-package.service';

export interface PurchaseTokensParams {
  userId: string;
  userType: UserType;
  userTypeId: string;
  packageId: string;
  paymentData: Record<string, any>;
}

export interface PurchaseTokensResult {
  success: boolean;
  balance: TokenBalance;
  transactionId: string;
  paymentConfirmation?: any;
}

@Injectable()
export class PurchaseTokensUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly tokenBalanceRepository: TokenBalanceRepository,
    private readonly tokenTransactionRepository: TokenTransactionRepository,
    private readonly paymentGateway: IPaymentGateway,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    private readonly tokenPackageService: TokenPackageService,
  ) {
    super(PurchaseTokensUseCase.name);
  }

  async execute(params: PurchaseTokensParams): Promise<PurchaseTokensResult> {
    const { userId, userType, userTypeId, packageId, paymentData } = params;

    this.logger.log(`Processing token purchase for user ${userId}, package: ${packageId}`);

    // Validate package
    const tokenPackage = this.tokenPackageService.getPackageById(packageId);
    if (!tokenPackage) {
      throw new BadRequestException(`Invalid package ID: ${packageId}`);
    }

    // Get or create balance
    let balance = await this.tokenBalanceRepository.findByUserId(userId);
    if (!balance) {
      balance = await this.tokenBalanceRepository.create({
        userId,
        userType,
        userTypeId,
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
        totalGranted: 0,
      });
    }

    // Create pending transaction
    const transaction = await this.tokenTransactionRepository.create({
      userId,
      userType,
      userTypeId,
      type: TransactionType.PURCHASE,
      amount: tokenPackage.tokens,
      balanceBefore: balance.balance,
      balanceAfter: balance.balance + tokenPackage.tokens,
      status: TransactionStatus.PENDING,
      metadata: {
        packageId: tokenPackage.id,
        price: tokenPackage.price,
        currency: tokenPackage.currency,
      },
    });

    try {
      // Process payment
      const paymentResult = await this.paymentGateway.processPayment({
        amount: tokenPackage.price,
        currency: tokenPackage.currency,
        description: `${tokenPackage.name} - ${tokenPackage.tokens} tokens`,
        metadata: {
          userId,
          transactionId: transaction.id,
          packageId: tokenPackage.id,
        },
        paymentData,
      });

      if (paymentResult.success) {
        // Update balance
        await this.tokenBalanceRepository.incrementBalance(
          userId,
          tokenPackage.tokens,
          false // Not a grant, this is a purchase
        );

        // Update balance purchased amount
        await this.tokenBalanceRepository.repo.update(
          { userId },
          { 
            totalPurchased: () => `total_purchased + ${tokenPackage.tokens}`,
            lastPurchaseAt: new Date(),
          }
        );

        // Update transaction status
        const completedMetadata = Object.assign({}, transaction.metadata, {
          paymentReference: paymentResult.paymentReference,
          paymentMethod: paymentResult.paymentMethod,
        });
        await this.tokenTransactionRepository.repo.update(
          { id: transaction.id },
          {
            status: TransactionStatus.COMPLETED,
            metadata: completedMetadata,
          }
        );

        this.logger.log(`Token purchase completed for user ${userId}: ${tokenPackage.tokens} tokens`);

        const finalBalance = await this.tokenBalanceRepository.findByUserId(userId);

        // Queue purchase confirmation notification
        await this.notificationQueue.add({
          jobId: TOKEN_PURCHASE_CONFIRMATION,
          userId,
          userTypeId,
          metadata: {
            transactionId: transaction.id,
            packageId: tokenPackage.id,
            packageName: tokenPackage.name,
            tokensAmount: tokenPackage.tokens,
            price: tokenPackage.price,
            currency: tokenPackage.currency,
            paymentMethod: paymentResult.paymentMethod,
            newBalance: finalBalance.balance,
          },
        }).catch(error => {
          // Don't fail the transaction if notification fails
          this.logger.error(`Failed to queue purchase confirmation notification for user ${userId}`, error);
        });

        return {
          success: true,
          balance: finalBalance,
          transactionId: transaction.id,
          paymentConfirmation: paymentResult.confirmation,
        };
      } else {
        // Payment failed
        const failedMetadata = Object.assign({}, transaction.metadata, {
          failureReason: paymentResult.error,
        });
        await this.tokenTransactionRepository.repo.update(
          { id: transaction.id },
          {
            status: TransactionStatus.FAILED,
            metadata: failedMetadata,
          }
        );

        throw new HttpException(
          paymentResult.error || 'Payment failed',
          HttpStatus.PAYMENT_REQUIRED
        );
      }
    } catch (error) {
      // Update transaction as failed
      const errorMetadata = Object.assign({}, transaction.metadata, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      await this.tokenTransactionRepository.repo.update(
        { id: transaction.id },
        {
          status: TransactionStatus.FAILED,
          metadata: errorMetadata,
        }
      );

      this.logger.error(`Token purchase failed for user ${userId}`, error);
      throw error;
    }
  }
}