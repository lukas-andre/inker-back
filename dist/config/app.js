"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = config_1.registerAs('app', () => ({
    port: process.env.PORT,
    url: process.env.INKER_BACK_URL,
    rateLimitWindow: 60000,
    rateLimitMax: 400,
    defaultQueryLimit: 50,
}));
//# sourceMappingURL=app.js.map