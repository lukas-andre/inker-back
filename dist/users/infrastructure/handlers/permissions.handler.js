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
const serviceError_1 = require("../../../global/domain/interfaces/serviceError");
const findAllPermissions_usecase_1 = require("../../usecases/permission/findAllPermissions.usecase");
const findAllRoutes_usecase_1 = require("../../usecases/permission/findAllRoutes.usecase");
const findOnePermission_usecase_1 = require("../../usecases/permission/findOnePermission.usecase");
const initPermissions_usecase_1 = require("../../usecases/permission/initPermissions.usecase");
let PermissionsHandler = class PermissionsHandler {
    constructor(initPermissionsUseCase, findAllRoutesUseCase, findOnePermissionUseCase, findAllPermissionsUseCase) {
        this.initPermissionsUseCase = initPermissionsUseCase;
        this.findAllRoutesUseCase = findAllRoutesUseCase;
        this.findOnePermissionUseCase = findOnePermissionUseCase;
        this.findAllPermissionsUseCase = findAllPermissionsUseCase;
    }
    async handleInitial() {
        const result = await this.initPermissionsUseCase.execute();
        if (result instanceof serviceError_1.ServiceError) {
            throw new common_1.ConflictException(`Controller ${result.subject} already exists`);
        }
        return result;
    }
    async findRoutes() {
        return this.findAllRoutesUseCase.execute();
    }
    async findOne(id) {
        return await this.findOnePermissionUseCase.execute({ where: { id } });
    }
    async findAll(query) {
        return await this.findAllPermissionsUseCase.execute(query);
    }
};
PermissionsHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [initPermissions_usecase_1.InitPermissionsUseCase,
        findAllRoutes_usecase_1.FindAllRoutesUseCase,
        findOnePermission_usecase_1.FindOnePermissionUseCase,
        findAllPermissions_usecase_1.FindAllPermissionsUseCase])
], PermissionsHandler);
exports.PermissionsHandler = PermissionsHandler;
//# sourceMappingURL=permissions.handler.js.map