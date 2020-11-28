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
const findOneRole_usecase_1 = require("../../usecases/role/findOneRole.usecase");
const findAllRoles_usecase_1 = require("../../usecases/role/findAllRoles.usecase");
const initRoles_usecase_1 = require("../../usecases/role/initRoles.usecase");
let RolesHandler = class RolesHandler {
    constructor(initRolesUseCase, findOneRoleUseCase, findAllRolesUseCase) {
        this.initRolesUseCase = initRolesUseCase;
        this.findOneRoleUseCase = findOneRoleUseCase;
        this.findAllRolesUseCase = findAllRolesUseCase;
    }
    async initRoles() {
        return this.initRolesUseCase.execute();
    }
    async findOne(id) {
        return this.findOneRoleUseCase.execute(id);
    }
    async findAll(query) {
        return this.findAllRolesUseCase.execute(query);
    }
};
RolesHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [initRoles_usecase_1.InitRolesUseCase,
        findOneRole_usecase_1.FindOneRoleUseCase,
        findAllRoles_usecase_1.FindAllRolesUseCase])
], RolesHandler);
exports.RolesHandler = RolesHandler;
//# sourceMappingURL=roles.handler.js.map