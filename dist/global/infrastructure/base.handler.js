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
exports.BaseHandler = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_jwt_1 = require("passport-jwt");
const domain_exception_1 = require("../domain/exceptions/domain.exception");
const resolveDomainException_1 = require("./exceptions/resolveDomainException");
let BaseHandler = class BaseHandler {
    constructor(JWTService) {
        this.JWTService = JWTService;
    }
    getJwtPayloadFromRequest(request) {
        return this.JWTService.verify(passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(request));
    }
    resolve(result) {
        if (result instanceof domain_exception_1.DomainException)
            throw resolveDomainException_1.resolveDomainException(result);
        return result;
    }
};
BaseHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], BaseHandler);
exports.BaseHandler = BaseHandler;
//# sourceMappingURL=base.handler.js.map