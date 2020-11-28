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
exports.DefaultLoginUseCase = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/domain/services/users.service");
const userType_enum_1 = require("../../users/domain/enums/userType.enum");
const artists_service_1 = require("../../artists/domain/services/artists.service");
const customers_service_1 = require("../../customers/domain/customers.service");
const auth_service_1 = require("../domain/auth.service");
const domainConflict_exception_1 = require("../../global/domain/exceptions/domainConflict.exception");
const domain_exception_1 = require("../../global/domain/exceptions/domain.exception");
const domainNotFound_exception_copy_1 = require("../../global/domain/exceptions/domainNotFound.exception copy");
let DefaultLoginUseCase = class DefaultLoginUseCase {
    constructor(authService, usersService, artistsService, customersService) {
        this.authService = authService;
        this.usersService = usersService;
        this.artistsService = artistsService;
        this.customersService = customersService;
    }
    async execute(loginParams) {
        let response;
        const user = await this.usersService.findByType(loginParams.loginType, loginParams.identifier);
        if (!user || !user.active) {
            return new domainConflict_exception_1.DomainConflictException('Invalid credentials');
        }
        response = await this.defaultLogin(user, loginParams);
        if (response instanceof domain_exception_1.DomainException)
            return response;
        return response;
    }
    async defaultLogin(user, loginParams) {
        const result = await this.usersService.validatePassword(loginParams.password, user.password);
        if (!result) {
            return new domainConflict_exception_1.DomainConflictException('User is not valid');
        }
        const entity = await this.findUserEntityByType(user.userType, user.id);
        if (!entity) {
            return new domainNotFound_exception_copy_1.DomainNotFoundException(`User not found`);
        }
        return this.authService.generateJwtByUserType(user.userType, user, entity);
    }
    async findUserEntityByType(userType, userId) {
        if (userType === userType_enum_1.UserType.CUSTOMER)
            return await this.customersService.findOne({ where: { userId } });
        if (userType === userType_enum_1.UserType.ARTIST)
            return await this.artistsService.findOne({ where: { userId } });
    }
};
DefaultLoginUseCase = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        artists_service_1.ArtistsService,
        customers_service_1.CustomersService])
], DefaultLoginUseCase);
exports.DefaultLoginUseCase = DefaultLoginUseCase;
//# sourceMappingURL=defaultLogin.usecase.js.map