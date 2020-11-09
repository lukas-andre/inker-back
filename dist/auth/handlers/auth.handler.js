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
const users_service_1 = require("../../users/services/users.service");
const auth_service_1 = require("../services/auth.service");
const loginType_enum_1 = require("../enums/loginType.enum");
const userType_enum_1 = require("../../users/enums/userType.enum");
const artists_service_1 = require("../../artists/services/artists.service");
const customers_service_1 = require("../../customers/services/customers.service");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const artist_entity_1 = require("../../artists/entities/artist.entity");
let AuthHandler = class AuthHandler {
    constructor(authService, usersService, artistsService, customersService) {
        this.authService = authService;
        this.usersService = usersService;
        this.artistsService = artistsService;
        this.customersService = customersService;
    }
    async login(loginDto) {
        let response;
        const user = await this.usersService.findByType(loginDto.loginType, loginDto.identifier);
        if (!user || !user.active) {
            throw new common_1.ConflictException('Invalid credentials');
        }
        let isValid = false;
        switch (loginDto.loginType) {
            case loginType_enum_1.LoginType.FACEBOOK:
                isValid = true;
                break;
            case loginType_enum_1.LoginType.GOOGLE:
                isValid = false;
                break;
            default:
                response = await this.defaultLogin(user, loginDto);
                break;
        }
        if (response instanceof common_1.HttpException)
            throw response;
        return response;
    }
    async defaultLogin(user, loginDto) {
        const result = await this.usersService.validatePassword(loginDto.password, user.password);
        if (!result) {
            return new common_1.ConflictException('User is not valid');
        }
        const entity = await this.findUserEntityByType(user.userType, user.id);
        if (!entity) {
            return new common_1.NotFoundException(`${user.userType}`);
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
AuthHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        artists_service_1.ArtistsService,
        customers_service_1.CustomersService])
], AuthHandler);
exports.AuthHandler = AuthHandler;
//# sourceMappingURL=auth.handler.js.map