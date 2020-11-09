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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
const initRolePermission_data_1 = require("../data/initRolePermission.data");
const initRoles_data_1 = require("../data/initRoles.data");
let RolesService = class RolesService {
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async initRoles(permissions) {
        for (const initRole of initRoles_data_1.initRoles) {
            const role = Object.assign(new role_entity_1.Role(), initRole);
            if (initRole.name !== 'admin') {
                role.permissions = permissions.filter(permission => initRolePermission_data_1.initRolePermissions
                    .find(init => init.role === role.name)
                    .controllers.includes(permission.controller));
            }
            await this.rolesRepository.save(role);
        }
        return await this.findAll({});
    }
    async findAll(query) {
        const { limit, offset } = query, rest = __rest(query, ["limit", "offset"]);
        return await this.rolesRepository.find({
            where: rest,
            order: {
                created_at: 'ASC',
            },
            skip: offset,
            take: limit,
            cache: true,
        });
    }
    async findById(id) {
        return await this.rolesRepository.findOne(id, {
            relations: ['permissions'],
        });
    }
    async findOne(query) {
        return await this.rolesRepository.findOne(query);
    }
};
RolesService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(role_entity_1.Role, 'user-db')),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesService);
exports.RolesService = RolesService;
//# sourceMappingURL=roles.service.js.map