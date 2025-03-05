import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
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
    private locationDbDataSource: DataSource,
    // @InjectDataSource('customer-feed-db')
    // private customerFeedDbDataSource: DataSource,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs', 'https://docs.nestjs.com'),
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
      // () =>
      //   this.db.pingCheck('inker-agenda', {
      //     connection: this.agendaDbDataSource,
      //     timeout: 1500,
      //   }),
      () =>
        this.db.pingCheck('inker-location', {
          connection: this.locationDbDataSource,
          timeout: 1500,
        }),
      // () =>
      //   this.db.pingCheck('inker-customer-feed', {
      //     connection: this.customerFeedDbDataSource,
      //     timeout: 1500,
      //   }),
    ]);
  }
}
