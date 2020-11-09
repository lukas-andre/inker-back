"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const login_dto_1 = require("../dtos/login.dto");
const auth_handler_1 = require("../handlers/auth.handler");
let AuthController = AuthController_1 = class AuthController {
    constructor(authHandler) {
        this.authHandler = authHandler;
        this.serviceName = AuthController_1.name;
        this.logger = new common_1.Logger(this.serviceName);
    }
    async login(loginDto) {
        return await this.authHandler.login(loginDto);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Login User' }),
    common_1.HttpCode(200),
    swagger_1.ApiResponse({ status: 200, description: 'Login successful.' }),
    swagger_1.ApiResponse({ status: 401, description: 'Invalid credentials.' }),
    common_1.Post('login'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
AuthController = AuthController_1 = __decorate([
    swagger_1.ApiTags('auth'),
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [auth_handler_1.AuthHandler])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map