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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesHandler = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const permissions_service_1 = require("../services/permissions.service");
const roles_service_1 = require("../services/roles.service");
let RolesHandler = class RolesHandler {
    constructor(rolesService, permissionsService, configService) {
        this.rolesService = rolesService;
        this.permissionsService = permissionsService;
        this.configService = configService;
    }
    async initRoles() {
        const permissions = await this.permissionsService.findAll({});
        return await this.rolesService.initRoles(permissions);
    }
    async findOne(id) {
        return await this.rolesService.findOne({ where: { id } });
    }
    async findAll(query) {
        return await this.rolesService.findAll(query);
    }
};
RolesHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [roles_service_1.RolesService,
        permissions_service_1.PermissionsService,
        config_1.ConfigService])
], RolesHandler);
exports.RolesHandler = RolesHandler;
//# sourceMappingURL=roles.handler.js.map