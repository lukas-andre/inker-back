"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = config_1.registerAs('auth', () => ({
    jwtIssuer: process.env.JWT_ISSUER,
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    jwtExpiration: parseInt(process.env.JWT_EXPIRATION, 30),
    saltLength: 8,
}));
//# sourceMappingURL=auth.js.map