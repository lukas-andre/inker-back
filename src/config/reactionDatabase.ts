import { registerAs } from '@nestjs/config';

export default registerAs('reactionDb', () => ({
  type: 'postgres',
  name: 'reaction-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-reaction',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../reactions/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNC,
  logging: false,
  cache: true,
}));
