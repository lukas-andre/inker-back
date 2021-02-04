import { registerAs } from '@nestjs/config';

export default registerAs('customerDb', () => ({
  type: 'postgres',
  name: 'customer-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-customer',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../customers/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNC,
  logging: false,
}));
