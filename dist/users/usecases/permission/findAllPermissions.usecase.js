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
exports.FindAllPermissionsUseCase = void 0;
const common_1 = require("@nestjs/common");
const permissions_service_1 = require("../../domain/services/permissions.service");
let FindAllPermissionsUseCase = class FindAllPermissionsUseCase {
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    async execute(options) {
        return this.permissionsService.findAll(options);
    }
};
FindAllPermissionsUseCase = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], FindAllPermissionsUseCase);
exports.FindAllPermissionsUseCase = FindAllPermissionsUseCase;
//# sourceMappingURL=findAllPermissions.usecase.js.map