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
exports.UsersHandler = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const domain_exception_1 = require("../../../global/domain/exceptions/domain.exception");
const resolveDomainException_1 = require("../../../global/infrastructure/exceptions/resolveDomainException");
const createUserByType_params_1 = require("../../usecases/user/interfaces/createUserByType.params");
const crerateUserByType_usecase_1 = require("../../usecases/user/crerateUserByType.usecase");
let UsersHandler = class UsersHandler {
    constructor(createUserByTypeUseCase, configService) {
        this.createUserByTypeUseCase = createUserByTypeUseCase;
        this.configService = configService;
    }
    async handleCreate(dto) {
        const result = await this.createUserByTypeUseCase.execute(dto);
        if (result instanceof domain_exception_1.DomainException) {
            throw resolveDomainException_1.resolveDomainException(result);
        }
        return result;
    }
};
UsersHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [crerateUserByType_usecase_1.CreateUserByTypeUseCase,
        config_1.ConfigService])
], UsersHandler);
exports.UsersHandler = UsersHandler;
//# sourceMappingURL=users.handler.js.map