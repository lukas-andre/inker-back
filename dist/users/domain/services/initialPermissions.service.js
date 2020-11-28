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
var InitialPermissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialPermissionsService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const permission_entity_1 = require("../../infrastructure/entities/permission.entity");
const typeorm_2 = require("typeorm");
let InitialPermissionsService = InitialPermissionsService_1 = class InitialPermissionsService {
    constructor(container, permissionsRepository) {
        this.container = container;
        this.permissionsRepository = permissionsRepository;
        this.serviceName = InitialPermissionsService_1.name;
        this.logger = new common_1.Logger(this.serviceName);
    }
    async initPermissions() {
        const controllersNames = new Set();
        const providers = [...this.container.values()];
        providers.forEach(modules => {
            modules.controllers.forEach(controller => controllersNames.add(controller.name));
        });
        const controllersNamesList = [...controllersNames.values()].sort();
        for (const [index, controllerName] of controllersNamesList.entries()) {
            const permission = Object.assign(new permission_entity_1.Permission(), {
                id: index,
                controller: controllerName,
                action: '*',
            });
            try {
                await this.permissionsRepository.save(permission);
            }
            catch (error) {
                this.logger.error(error.detail);
                return { error: this.serviceName, subject: controllerName };
            }
        }
        return await this.permissionsRepository.find();
    }
    async getAllRoutes() {
        return await this.permissionsRepository.find();
    }
};
InitialPermissionsService = InitialPermissionsService_1 = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('ModulesContainer')),
    __param(1, typeorm_1.InjectRepository(permission_entity_1.Permission, 'user-db')),
    __metadata("design:paramtypes", [core_1.ModulesContainer,
        typeorm_2.Repository])
], InitialPermissionsService);
exports.InitialPermissionsService = InitialPermissionsService;
//# sourceMappingURL=initialPermissions.service.js.map