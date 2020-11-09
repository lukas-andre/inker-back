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
exports.RolesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const role_entity_1 = require("../entities/role.entity");
const roles_handler_1 = require("../handlers/roles.handler");
let RolesController = class RolesController {
    constructor(rolesHandler) {
        this.rolesHandler = rolesHandler;
    }
    async initRoles(query) {
        return await this.rolesHandler.initRoles();
    }
    async findAll(query) {
        return await this.rolesHandler.findAll(query);
    }
    async findOne(id) {
        const role = await this.rolesHandler.findOne(id);
        if (!role) {
            throw new common_1.NotFoundException();
        }
        return role;
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Init Roles (Init Permissions first)' }),
    swagger_1.ApiOkResponse({ description: 'Init roles ok', isArray: true, type: role_entity_1.Role }),
    common_1.Get('init-roles'),
    openapi.ApiResponse({ status: 200, type: [require("../entities/role.entity").Role] }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "initRoles", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Find Roles' }),
    swagger_1.ApiOkResponse({ isArray: true, type: role_entity_1.Role }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: [require("../entities/role.entity").Role] }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get Role By Id' }),
    swagger_1.ApiParam({ name: 'id', required: true }),
    swagger_1.ApiOkResponse({ description: 'The role exists.', type: role_entity_1.Role }),
    swagger_1.ApiNotFoundResponse({ status: 404, description: 'Role does not exist.' }),
    common_1.Get(':id'),
    openapi.ApiResponse({ status: 200, type: require("../entities/role.entity").Role }),
    __param(0, common_1.Param('id', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "findOne", null);
RolesController = __decorate([
    swagger_1.ApiTags('roles'),
    common_1.Controller('roles'),
    __metadata("design:paramtypes", [roles_handler_1.RolesHandler])
], RolesController);
exports.RolesController = RolesController;
//# sourceMappingURL=roles.controller.js.map