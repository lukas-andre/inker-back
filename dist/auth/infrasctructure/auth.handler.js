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
exports.AuthHandler = void 0;
const common_1 = require("@nestjs/common");
const domain_exception_1 = require("../../global/domain/exceptions/domain.exception");
const resolveDomainException_1 = require("../../global/infrastructure/exceptions/resolveDomainException");
const defaultLogin_usecase_1 = require("../usecases/defaultLogin.usecase");
const loginType_enum_1 = require("../domain/enums/loginType.enum");
let AuthHandler = class AuthHandler {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
    }
    async handleLogin(dto) {
        let result;
        switch (dto.loginType) {
            case loginType_enum_1.LoginType.FACEBOOK:
                break;
            case loginType_enum_1.LoginType.GOOGLE:
                break;
            default:
                result = await this.loginUseCase.execute(dto);
                break;
        }
        if (result instanceof domain_exception_1.DomainException) {
            throw resolveDomainException_1.resolveDomainException(result);
        }
        return result;
    }
};
AuthHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [defaultLogin_usecase_1.DefaultLoginUseCase])
], AuthHandler);
exports.AuthHandler = AuthHandler;
//# sourceMappingURL=auth.handler.js.map