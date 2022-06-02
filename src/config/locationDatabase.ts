import { registerAs } from '@nestjs/config';

export default registerAs('locationDb', () => ({
  type: 'postgres',
  name: 'location-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-location',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../locations/**/*.entity{.ts,.js}'],
  synchronize: Boolean(process.env.TYPEORM_SYNC),
  logging: ['error'],
  cache: true,
}));
