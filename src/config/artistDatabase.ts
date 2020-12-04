import { registerAs } from '@nestjs/config';

export default registerAs('artistDb', () => ({
  type: 'postgres',
  name: 'artist-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-artist',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../artists/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNC,
  logging: true,
  cache: true,
}));
