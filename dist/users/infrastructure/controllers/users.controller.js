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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const createUserReq_dto_1 = require("../dtos/createUserReq.dto");
const users_handler_1 = require("../handlers/users.handler");
const createUserRes_dto_1 = require("../dtos/createUserRes.dto");
let UsersController = class UsersController {
    constructor(usersHandler) {
        this.usersHandler = usersHandler;
    }
    async create(createUserDto) {
        return await this.usersHandler.handleCreate(createUserDto);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Create User' }),
    swagger_1.ApiCreatedResponse({
        description: 'Users has been created',
        type: createUserRes_dto_1.CreateUserResDto,
    }),
    swagger_1.ApiNotFoundResponse({ description: 'Rol does not exists' }),
    swagger_1.ApiConflictResponse({ description: 'Users already exists' }),
    common_1.Post(),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, common_2.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createUserReq_dto_1.CreateUserReqDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
UsersController = __decorate([
    swagger_1.ApiTags('users'),
    common_1.Controller('users'),
    __metadata("design:paramtypes", [users_handler_1.UsersHandler])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map