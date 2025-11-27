import { InjectQueue } from '@nestjs/bull';
import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    @InjectDataSource('user-db')
    private userDbDataSource: DataSource,
    @InjectDataSource('customer-db')
    private customerDbDataSource: DataSource,
    @InjectDataSource('artist-db')
    private artistDbDataSource: DataSource,
    @InjectDataSource('follow-db')
    private followDbDataSource: DataSource,
    @InjectDataSource('reaction-db')
    private reactionDbDataSource: DataSource,
    @InjectDataSource('post-db')
    private postDbDataSource: DataSource,
    @InjectDataSource('genre-db')
    private genreDbDataSource: DataSource,
    @InjectDataSource('tag-db')
    private tagDbDataSource: DataSource,
    @InjectDataSource('agenda-db')
    private agendaDbDataSource: DataSource,
    @InjectDataSource('location-db')
    private locationDbDataSource: DataSource, // @InjectDataSource('customer-feed-db') // private customerFeedDbDataSource: DataSource,
    @InjectQueue('notification')
    private notificationQueue: Queue,
  ) { }

  private async checkRedis(timeout: number = 1500): Promise<HealthIndicatorResult> {
    try {
      const client = await this.notificationQueue.client;
      await Promise.race([
        client.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), timeout)),
      ]);
      return {
        redis: {
          status: 'up',
          message: 'Redis is healthy',
        },
      };
    } catch (error) {
      return {
        redis: {
          status: 'down',
          message: error instanceof Error ? error.message : 'Redis connection failed',
        },
      };
    }
  }

  @Get()
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      () =>
        this.db.pingCheck('inker-user', {
          connection: this.userDbDataSource,
          timeout: 1500,
        }),
      () =>
        this.db.pingCheck('inker-customer', {
          connection: this.customerDbDataSource,
          timeout: 1500,
        }),
      () =>
        this.db.pingCheck('inker-artist', {
          connection: this.artistDbDataSource,
          timeout: 1500,
        }),
      () =>
        this.db.pingCheck('inker-follow', {
          connection: this.followDbDataSource,
          timeout: 1500,
        }),
      () =>
        this.db.pingCheck('inker-reaction', {
          connection: this.reactionDbDataSource,
          timeout: 1500,
        }),
      () =>
        this.db.pingCheck('inker-post', {
          connection: this.postDbDataSource,
          timeout: 1500,
        }),
      () =>
        this.db.pingCheck('inker-genre', {
          connection: this.genreDbDataSource,
          timeout: 1500,
        }),
      () =>
        this.db.pingCheck('inker-tag', {
          connection: this.tagDbDataSource,
          timeout: 1500,
        }),

      () =>
        this.db.pingCheck('inker-location', {
          connection: this.locationDbDataSource,
          timeout: 1500,
        }),
      () => this.checkRedis(1500),
    ]);

    this.logger.log({ result });
    return result;
  }
}
