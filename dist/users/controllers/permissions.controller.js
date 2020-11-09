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
exports.PermissionsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permission_entity_1 = require("../entities/permission.entity");
const permissions_handler_1 = require("../handlers/permissions.handler");
let PermissionsController = class PermissionsController {
    constructor(permissionsHandler) {
        this.permissionsHandler = permissionsHandler;
    }
    async findAll(query) {
        return await this.permissionsHandler.findAll(query);
    }
    async initial() {
        return await this.permissionsHandler.handleInitial();
    }
    async findRoutes() {
        return await this.permissionsHandler.findRoutes();
    }
    async findOne(id) {
        const role = await this.permissionsHandler.findOne(id);
        if (!role) {
            throw new common_1.NotFoundException();
        }
        return role;
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Find Permissions' }),
    swagger_1.ApiOkResponse({
        description: 'The permissions exists.',
        isArray: true,
        type: permission_entity_1.Permission,
    }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: [require("../entities/permission.entity").Permission] }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "findAll", null);
__decorate([
    common_1.Get('/initial'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "initial", null);
__decorate([
    common_1.Get('/routes'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "findRoutes", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get Permissions By Id' }),
    swagger_1.ApiParam({ name: 'id', required: true }),
    swagger_1.ApiOkResponse({
        description: 'The permissions exists.',
        isArray: true,
        type: permission_entity_1.Permission,
    }),
    swagger_1.ApiResponse({ status: 404, description: 'Permission does not exist.' }),
    common_1.Get(':id'),
    openapi.ApiResponse({ status: 200, type: require("../entities/permission.entity").Permission }),
    __param(0, common_1.Param('id', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "findOne", null);
PermissionsController = __decorate([
    swagger_1.ApiTags('permissions'),
    common_1.Controller('permissions'),
    __metadata("design:paramtypes", [permissions_handler_1.PermissionsHandler])
], PermissionsController);
exports.PermissionsController = PermissionsController;
//# sourceMappingURL=permissions.controller.js.map