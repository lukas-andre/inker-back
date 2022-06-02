import { registerAs } from '@nestjs/config';

export default registerAs('followDb', () => ({
  type: 'postgres',
  name: 'follow-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-follow',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../follows/**/*.entity{.ts,.js}'],
  synchronize: Boolean(process.env.TYPEORM_SYNC),
  logging: false,
  cache: true,
}));
