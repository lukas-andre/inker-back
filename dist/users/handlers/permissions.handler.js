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
exports.PermissionsHandler = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const permissions_service_1 = require("../services/permissions.service");
const initialPermissions_service_1 = require("../services/initialPermissions.service");
let PermissionsHandler = class PermissionsHandler {
    constructor(permissionsService, initialPermissionsService, configService) {
        this.permissionsService = permissionsService;
        this.initialPermissionsService = initialPermissionsService;
        this.configService = configService;
    }
    async handleInitial() {
        const result = await this.initialPermissionsService.initPermissions();
        if (result.hasOwnProperty('error')) {
            throw new common_1.ConflictException(`Controller ${result.subject} already exists`);
        }
        return result;
    }
    async findRoutes() {
        return this.initialPermissionsService.getAllRoutes();
    }
    async findOne(id) {
        return await this.permissionsService.findOne({ id });
    }
    async findAll(query) {
        return await this.permissionsService.findAll(query);
    }
};
PermissionsHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService,
        initialPermissions_service_1.InitialPermissionsService,
        config_1.ConfigService])
], PermissionsHandler);
exports.PermissionsHandler = PermissionsHandler;
//# sourceMappingURL=permissions.handler.js.map