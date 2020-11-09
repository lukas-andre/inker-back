"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = config_1.registerAs('userDb', () => ({
    type: 'postgres',
    name: 'user-db',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: 'inker-user',
    port: parseInt(process.env.DB_PORT, 5432),
    entities: [__dirname + '/../{auth,users}/**/*.entity{.ts,.js}'],
    synchronize: process.env.TYPEORM_SYNC,
    logging: true,
}));
//# sourceMappingURL=userDatabase.js.map