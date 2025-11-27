import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetTokenBalanceUseCase } from '../../usecases/get-token-balance.usecase';
import { GetTransactionHistoryUseCase } from '../../usecases/get-transaction-history.usecase';
import { PurchaseTokensUseCase } from '../../usecases/purchase-tokens.usecase';
import { TokenBalanceDto } from '../../domain/dtos/token-balance.dto';
import { TokenTransactionDto } from '../../domain/dtos/token-transaction.dto';
import { PurchaseTokensDto } from '../../domain/dtos/purchase-tokens.dto';
import { TokenPackageDto } from '../../domain/dtos/token-package.dto';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { TokenPackageService } from '../services/token-package.service';

@ApiTags('Tokens')
@Controller('tokens')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TokensController {
  constructor(
    private readonly getTokenBalanceUseCase: GetTokenBalanceUseCase,
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
    private readonly purchaseTokensUseCase: PurchaseTokensUseCase,
    private readonly requestContext: RequestContextService,
    private readonly tokenPackageService: TokenPackageService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current token balance' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current token balance',
    type: TokenBalanceDto,
  })
  async getBalance(): Promise<TokenBalanceDto> {
    const user = this.requestContext.getContext();
    const balance = await this.getTokenBalanceUseCase.execute({
      userId: user.id,
      userType: user.userType,
      userTypeId: user.userTypeId,
    });

    return TokenBalanceDto.fromEntity(balance);
  }

  @Get('packages')
  @ApiOperation({ summary: 'Get available token packages' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns list of available token packages',
    type: [TokenPackageDto],
  })
  async getPackages(): Promise<TokenPackageDto[]> {
    const packages = this.tokenPackageService.getAllPackages();
    return packages.map(pkg => TokenPackageDto.fromPackage(pkg));
  }

  @Post('purchase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Purchase tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens purchased successfully',
    type: TokenBalanceDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid package or payment data',
  })
  @ApiResponse({
    status: HttpStatus.PAYMENT_REQUIRED,
    description: 'Payment failed',
  })
  async purchaseTokens(
    @Body() dto: PurchaseTokensDto,
  ): Promise<TokenBalanceDto> {
    const user = this.requestContext.getContext();
    const result = await this.purchaseTokensUseCase.execute({
      userId: user.id,
      userType: user.userType,
      userTypeId: user.userTypeId,
      packageId: dto.packageId,
      paymentData: dto.paymentData,
    });

    return TokenBalanceDto.fromEntity(result.balance);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get token transaction history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated transaction history',
    type: [TokenTransactionDto],
  })
  async getTransactions(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('type') type?: string,
  ): Promise<TokenTransactionDto[]> {
    const user = this.requestContext.getContext();
    const transactions = await this.getTransactionHistoryUseCase.execute({
      userId: user.id,
      limit: limit || 20,
      offset: offset || 0,
      type,
    });

    return transactions.map(tx => TokenTransactionDto.fromEntity(tx));
  }
}