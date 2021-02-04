import { registerAs } from '@nestjs/config';

export default registerAs('tagDb', () => ({
  type: 'postgres',
  name: 'tag-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-tag',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../tags/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNC,
  logging: false,
  cache: true,
}));
