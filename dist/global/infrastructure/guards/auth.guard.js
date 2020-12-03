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
var AuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_jwt_1 = require("passport-jwt");
const jwt_1 = require("@nestjs/jwt");
let AuthGuard = AuthGuard_1 = class AuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthGuard_1.name);
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const calledController = context.getClass().name;
        const calledAction = context.getHandler().name;
        console.log('calledAction: ', calledAction);
        console.log('calledController: ', calledController);
        const jwt = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        if (!jwt) {
            return false;
        }
        let verifyJwt;
        try {
            verifyJwt = this.jwtService.verify(jwt);
        }
        catch (error) {
            this.logger.error(error);
            return false;
        }
        if (!verifyJwt) {
            return false;
        }
        const permission = verifyJwt.permision.find(p => p.c == calledController);
        console.log('permission: ', permission);
        if (!permission) {
            return false;
        }
        return true;
    }
};
AuthGuard = AuthGuard_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthGuard);
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth.guard.js.map