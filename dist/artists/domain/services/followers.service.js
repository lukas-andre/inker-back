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
var FollowersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const follower_entity_1 = require("../../infrastructure/entities/follower.entity");
let FollowersService = FollowersService_1 = class FollowersService {
    constructor(followersRepository) {
        this.followersRepository = followersRepository;
        this.serviceName = FollowersService_1.name;
    }
    async findById(id) {
        return await this.followersRepository.findOne(id);
    }
    async find(options) {
        return await this.followersRepository.find(options);
    }
    async findOne(options) {
        return await this.followersRepository.findOne(options);
    }
    async save(artist) {
        return await this.followersRepository.save(artist);
    }
    async existFollower(artistId, userId) {
        const result = await this.followersRepository.query(`SELECT EXISTS(SELECT 1 FROM follower f WHERE f.artist_id = $1 AND f.user_id = $2)`, [artistId, userId]);
        return result.pop().exists;
    }
    async countFollowers(id) {
        return this.followersRepository.count({ where: { artistId: id } });
    }
    async delete(id) {
        return await this.followersRepository.delete(id);
    }
};
FollowersService = FollowersService_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(follower_entity_1.Follower, 'artist-db')),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FollowersService);
exports.FollowersService = FollowersService;
//# sourceMappingURL=followers.service.js.map