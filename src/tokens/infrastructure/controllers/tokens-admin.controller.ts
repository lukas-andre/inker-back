import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  Ip,
  Query,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GrantTokensUseCase } from '../../usecases/grant-tokens.usecase';
import { AdminGrantTokensDto } from '../../domain/dtos/admin-grant-tokens.dto';
import { TokenBalanceDto } from '../../domain/dtos/token-balance.dto';
import { TokenMetricsDto, DailyTokenStatsDto } from '../../domain/dtos/token-metrics.dto';
import { TokenBalanceRepository } from '../repositories/token-balance.repository';
import { TokenTransactionRepository } from '../repositories/token-transaction.repository';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TokenPackageService } from '../services/token-package.service';
import { UpdateTokenPackageDto } from '../../domain/dtos/update-package.dto';
import { TokenPackageDto } from '../../domain/dtos/token-package.dto';
import { TokenPackage } from '../../domain/constants/token-packages';

@ApiTags('Tokens Admin')
@Controller('tokens/admin')
export class TokensAdminController {
  constructor(
    private readonly grantTokensUseCase: GrantTokensUseCase,
    private readonly configService: ConfigService,
    private readonly tokenBalanceRepository: TokenBalanceRepository,
    private readonly tokenTransactionRepository: TokenTransactionRepository,
    private readonly tokenPackageService: TokenPackageService,
  ) {}

  @Post('grant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Grant tokens to a user (Admin only)',
    description: 'Manually grant tokens to a user. Requires admin secret token.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens granted successfully',
    type: TokenBalanceDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid admin token',
  })
  async grantTokens(
    @Headers('x-admin-token') adminToken: string,
    @Body() dto: AdminGrantTokensDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<TokenBalanceDto> {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    // Execute grant with audit metadata
    const result = await this.grantTokensUseCase.execute({
      ...dto,
      metadata: {
        adminUserId: dto.adminUserId || 'admin',
        ipAddress,
        userAgent,
        grantedVia: 'ADMIN_ENDPOINT',
        timestamp: new Date(),
      },
    });

    // Return balance DTO
    const balance = await this.tokenBalanceRepository.findByUserId(dto.userId);
    return TokenBalanceDto.fromEntity(balance);
  }

  @Get('metrics')
  @ApiOperation({ 
    summary: 'Get token system metrics (Admin only)',
    description: 'Get aggregated metrics about token usage and balances.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System metrics',
    type: TokenMetricsDto,
  })
  async getMetrics(
    @Headers('x-admin-token') adminToken: string,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    // Get aggregated metrics
    const balances = await this.tokenBalanceRepository.repo
      .createQueryBuilder('balance')
      .select([
        'COUNT(DISTINCT balance.userId) as totalUsers',
        'SUM(balance.balance) as totalTokensInCirculation',
        'SUM(balance.totalConsumed) as totalTokensConsumed',
        'SUM(balance.totalGranted) as totalTokensGranted',
        'SUM(balance.totalPurchased) as totalTokensPurchased',
        'AVG(balance.balance) as averageBalance',
      ])
      .getRawOne();

    // Get recent activity
    const recentActivity = await this.tokenTransactionRepository.repo
      .createQueryBuilder('transaction')
      .select([
        'transaction.type as type',
        'COUNT(*) as count',
        'SUM(ABS(transaction.amount)) as totalAmount',
      ])
      .where('transaction.createdAt >= :date', { 
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      })
      .groupBy('transaction.type')
      .getRawMany();

    // Get users with low balance
    const lowBalanceUsers = await this.tokenBalanceRepository.repo
      .createQueryBuilder('balance')
      .select(['balance.userId', 'balance.userType', 'balance.balance'])
      .where('balance.balance < :threshold AND balance.balance > 0', { threshold: 5 })
      .orderBy('balance.balance', 'ASC')
      .limit(10)
      .getMany();

    return {
      overview: balances,
      recentActivity,
      lowBalanceUsers,
      timestamp: new Date(),
    };
  }

  @Get('transactions')
  @ApiOperation({ 
    summary: 'Get recent manual grants (Admin only)',
    description: 'Get list of recent manual token grants by admins.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records to return',
  })
  async getManualGrants(
    @Headers('x-admin-token') adminToken: string,
    @Query('limit') limit?: number,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    const transactions = await this.tokenTransactionRepository.repo
      .createQueryBuilder('transaction')
      .where('transaction.type = :type', { type: TransactionType.MANUAL_ADJUSTMENT })
      .orderBy('transaction.createdAt', 'DESC')
      .limit(limit || 50)
      .getMany();

    return transactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      userType: tx.userType,
      userTypeId: tx.userTypeId,
      amount: tx.amount,
      balanceBefore: tx.balanceBefore,
      balanceAfter: tx.balanceAfter,
      reason: tx.metadata?.reason,
      adminUserId: tx.metadata?.adminUserId,
      ipAddress: tx.ipAddress,
      createdAt: tx.createdAt,
    }));
  }

  @Get('stats/daily')
  @ApiOperation({ 
    summary: 'Get daily token statistics (Admin only)',
    description: 'Get token usage statistics grouped by day.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look back (default: 30)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily statistics',
    type: [DailyTokenStatsDto],
  })
  async getDailyStats(
    @Headers('x-admin-token') adminToken: string,
    @Query('days') days?: number,
  ): Promise<DailyTokenStatsDto[]> {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    const daysToQuery = days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToQuery);

    const stats = await this.tokenTransactionRepository.repo
      .createQueryBuilder('transaction')
      .select([
        "DATE(transaction.createdAt) as date",
        "SUM(CASE WHEN transaction.type = 'CONSUME' THEN ABS(transaction.amount) ELSE 0 END) as consumed",
        "SUM(CASE WHEN transaction.type = 'PURCHASE' THEN transaction.amount ELSE 0 END) as purchased",
        "SUM(CASE WHEN transaction.type IN ('GRANT', 'MANUAL_ADJUSTMENT') THEN transaction.amount ELSE 0 END) as granted",
        "COUNT(DISTINCT transaction.userId) as activeUsers",
      ])
      .where('transaction.createdAt >= :startDate', { startDate })
      .andWhere('transaction.status = :status', { status: 'COMPLETED' })
      .groupBy('DATE(transaction.createdAt)')
      .orderBy('date', 'DESC')
      .getRawMany();

    return stats.map(stat => ({
      date: stat.date,
      consumed: parseInt(stat.consumed) || 0,
      purchased: parseInt(stat.purchased) || 0,
      granted: parseInt(stat.granted) || 0,
      activeUsers: parseInt(stat.activeusers) || 0,
    }));
  }

  @Get('users/:userId/balance')
  @ApiOperation({ 
    summary: 'Get specific user token balance (Admin only)',
    description: 'Get detailed token balance and history for a specific user.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User token details',
  })
  async getUserTokenDetails(
    @Headers('x-admin-token') adminToken: string,
    @Param('userId') userId: string,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    const balance = await this.tokenBalanceRepository.findByUserId(userId);
    if (!balance) {
      return {
        userId,
        balance: null,
        recentTransactions: [],
      };
    }

    const recentTransactions = await this.tokenTransactionRepository.repo
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .limit(20)
      .getMany();

    return {
      userId,
      balance: TokenBalanceDto.fromEntity(balance),
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        status: tx.status,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
    };
  }

  // Package Management Endpoints

  @Get('packages')
  @ApiOperation({ 
    summary: 'Get all token packages with admin details (Admin only)',
    description: 'Get all token packages including inactive ones.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive packages',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all packages',
    type: [TokenPackageDto],
  })
  async getAllPackages(
    @Headers('x-admin-token') adminToken: string,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    const packages = this.tokenPackageService.getAllPackages(includeInactive);
    return packages.map(pkg => TokenPackageDto.fromPackage(pkg));
  }

  @Put('packages/:packageId')
  @ApiOperation({ 
    summary: 'Update a token package (Admin only)',
    description: 'Update package details like price, tokens, or active status.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package updated successfully',
    type: TokenPackageDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Package not found',
  })
  async updatePackage(
    @Headers('x-admin-token') adminToken: string,
    @Param('packageId') packageId: string,
    @Body() updateDto: UpdateTokenPackageDto,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    const updatedPackage = this.tokenPackageService.updatePackage(packageId, updateDto);
    if (!updatedPackage) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    return TokenPackageDto.fromPackage(updatedPackage);
  }

  @Post('packages')
  @ApiOperation({ 
    summary: 'Create a new token package (Admin only)',
    description: 'Create a new package configuration.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Package created successfully',
    type: TokenPackageDto,
  })
  async createPackage(
    @Headers('x-admin-token') adminToken: string,
    @Body() packageData: Omit<TokenPackage, 'pricePerToken' | 'savings'>,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    // Validate package doesn't already exist
    const existing = this.tokenPackageService.getPackageById(packageData.id);
    if (existing) {
      throw new BadRequestException(`Package with ID ${packageData.id} already exists`);
    }

    const newPackage = this.tokenPackageService.createPackage(packageData);
    return TokenPackageDto.fromPackage(newPackage);
  }

  @Delete('packages/:packageId')
  @ApiOperation({ 
    summary: 'Deactivate a token package (Admin only)',
    description: 'Mark a package as inactive (soft delete).'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package deactivated successfully',
  })
  async deletePackage(
    @Headers('x-admin-token') adminToken: string,
    @Param('packageId') packageId: string,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    const success = this.tokenPackageService.deletePackage(packageId);
    if (!success) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    return { message: 'Package deactivated successfully' };
  }

  @Get('packages/stats')
  @ApiOperation({ 
    summary: 'Get package statistics (Admin only)',
    description: 'Get statistics about available packages.'
  })
  @ApiHeader({
    name: 'x-admin-token',
    description: 'Secret admin token for authentication',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package statistics',
  })
  async getPackageStats(
    @Headers('x-admin-token') adminToken: string,
  ) {
    // Validate admin token
    const secretToken = this.configService.get<string>('TOKENS_ADMIN_SECRET');
    if (!adminToken || adminToken !== secretToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    return this.tokenPackageService.getPackageStats();
  }
}