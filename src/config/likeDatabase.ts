import { registerAs } from '@nestjs/config';

export default registerAs('likeDb', () => ({
  type: 'postgres',
  name: 'like-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-like',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../likes/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNC,
  logging: true,
  cache: true,
}));
