import { registerAs } from '@nestjs/config';

export default registerAs('agendaDb', () => ({
  type: 'postgres',
  name: 'agenda-db',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'inker-agenda',
  port: parseInt(process.env.DB_PORT, 5432),
  entities: [__dirname + '/../agenda/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNC,
  logging: true,
  cache: true,
}));
