import { registerAs } from '@nestjs/config';

export default registerAs('customerFeedDb', () => ({
  type: 'postgres',
  name: 'customer-feed-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-customer-feed',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../customer-feed/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNC,
  logging: true,
  cache: true,
}));
