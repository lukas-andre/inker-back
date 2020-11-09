"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const userDatabase_1 = require("../config/userDatabase");
const app_1 = require("../config/app");
const auth_1 = require("../config/auth");
const aws_1 = require("../config/aws");
const customerDatabase_1 = require("../config/customerDatabase");
const artistDatabase_1 = require("../config/artistDatabase");
const s3_client_1 = require("./clients/s3.client");
let GlobalModule = class GlobalModule {
};
GlobalModule = __decorate([
    common_1.Global(),
    common_1.Module({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_1.default, userDatabase_1.default, customerDatabase_1.default, artistDatabase_1.default, auth_1.default, aws_1.default],
            }),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secretOrPrivateKey: config.get('auth.jwtSecretKey'),
                    signOptions: {
                        expiresIn: config.get('auth.jwtExpiration'),
                    },
                }),
            }),
        ],
        controllers: [],
        providers: [s3_client_1.S3Client],
        exports: [config_1.ConfigModule, s3_client_1.S3Client],
    })
], GlobalModule);
exports.GlobalModule = GlobalModule;
//# sourceMappingURL=global.module.js.map