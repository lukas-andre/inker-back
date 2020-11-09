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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const typeorm_2 = require("typeorm");
const bcryptjs_1 = require("bcryptjs");
const config_1 = require("@nestjs/config");
const loginType_enum_1 = require("../../auth/enums/loginType.enum");
let UsersService = class UsersService {
    constructor(usersRepository, configService) {
        this.usersRepository = usersRepository;
        this.configService = configService;
    }
    async create(createUserDto, role) {
        const exists = await this.usersRepository.count({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email },
            ],
        });
        console.log('exists: ', exists);
        if (exists) {
            return false;
        }
        const newUser = Object.assign(new user_entity_1.User(), Object.assign(Object.assign({}, createUserDto), { password: await this.hashPasword(createUserDto.password), role }));
        const _a = await this.usersRepository.save(newUser), { password } = _a, result = __rest(_a, ["password"]);
        return result;
    }
    async findById(id) {
        return await this.usersRepository.findOne(id);
    }
    async findByType(type, identifier) {
        return this.findOne({
            relations: ['role', 'role.permissions'],
            where: { [String(loginType_enum_1.LoginType[type]).toLocaleLowerCase()]: identifier },
        });
    }
    async find(options) {
        return await this.usersRepository.find(options);
    }
    async findOne(options) {
        return await this.usersRepository.findOne(options);
    }
    async delete(id) {
        return await this.usersRepository.delete(id);
    }
    async findAndCount(options) {
        return await this.usersRepository.findAndCount(options);
    }
    async edit(id, update) {
        return await this.usersRepository.save(Object.assign(await this.findById(id), update));
    }
    async hashPasword(password) {
        return await bcryptjs_1.hash(password, this.configService.get('auth.saltLength'));
    }
    async validatePassword(incomingPassword, databaseUserPassword) {
        return await bcryptjs_1.compare(incomingPassword, databaseUserPassword);
    }
};
UsersService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(user_entity_1.User, 'user-db')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map