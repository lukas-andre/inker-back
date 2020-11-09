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
const users_service_1 = require("../services/users.service");
const userType_enum_1 = require("../enums/userType.enum");
const customers_service_1 = require("../../customers/services/customers.service");
const createCustomer_dto_1 = require("../../customers/dtos/createCustomer.dto");
const serviceError_1 = require("../../global/interfaces/serviceError");
const serviceErrorStringify_1 = require("../../global/utils/serviceErrorStringify");
const createArtist_dto_1 = require("../../artists/dtos/createArtist.dto");
const artists_service_1 = require("../../artists/services/artists.service");
const roles_service_1 = require("../services/roles.service");
let UsersHandler = class UsersHandler {
    constructor(usersService, artistsService, customerService, rolesService, configService) {
        this.usersService = usersService;
        this.artistsService = artistsService;
        this.customerService = customerService;
        this.rolesService = rolesService;
        this.configService = configService;
    }
    async handleCreate(createUserDto) {
        const role = await this.rolesService.findOne({
            where: { name: createUserDto.userType.toLocaleLowerCase() },
        });
        if (!role) {
            throw new common_1.ConflictException('Role not exists');
        }
        const created = await this.usersService.create(createUserDto, role);
        if (!created) {
            throw new common_1.ConflictException('User already exists');
        }
        const response = await this.handleCreateByUserType(created.id, createUserDto);
        if (response instanceof serviceError_1.ServiceError) {
            this.handleCreateError(created.id, response);
        }
        return created;
    }
    async handleCreateByUserType(userId, dto) {
        const createByType = {
            [userType_enum_1.UserType.CUSTOMER]: async () => {
                const createCustomerDto = Object.assign(new createCustomer_dto_1.CreateCustomerDto(), Object.assign(Object.assign({}, dto), { contactEmail: dto.email ? dto.email : undefined, userId }));
                return await this.createCustomer(createCustomerDto);
            },
            [userType_enum_1.UserType.ARTIST]: async () => {
                const createArtistDto = Object.assign(new createArtist_dto_1.CreateArtistDto(), Object.assign(Object.assign({}, dto), { contactEmail: dto.email ? dto.email : undefined, userId }));
                return await this.createArtist(createArtistDto);
            },
        };
        return await createByType[dto.userType]();
    }
    async createArtist(createArtistDto) {
        const result = await this.artistsService.create(createArtistDto);
        return result;
    }
    async createCustomer(createCustomerDto) {
        const result = await this.customerService.create(createCustomerDto);
        return result;
    }
    async rollbackCreate(userId) {
        await this.usersService.delete(userId);
    }
    async handleCreateError(userId, error) {
        await this.rollbackCreate(userId);
        throw new common_1.ConflictException(serviceErrorStringify_1.serviceErrorStringify(error));
    }
};
UsersHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        artists_service_1.ArtistsService,
        customers_service_1.CustomersService,
        roles_service_1.RolesService,
        config_1.ConfigService])
], UsersHandler);
exports.UsersHandler = UsersHandler;
//# sourceMappingURL=users.handler.js.map