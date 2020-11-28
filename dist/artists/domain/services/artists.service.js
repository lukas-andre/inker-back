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
var ArtistsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistsService = void 0;
const common_1 = require("@nestjs/common");
const artist_entity_1 = require("../../infrastructure/entities/artist.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ArtistsService = ArtistsService_1 = class ArtistsService {
    constructor(artistsRepository) {
        this.artistsRepository = artistsRepository;
        this.serviceName = ArtistsService_1.name;
    }
    async create(dto) {
        const exists = await this.artistsRepository.findOne({
            userId: dto.userId,
        });
        if (exists) {
            return {
                error: `Artists with user id: ${dto.userId} already exist`,
                subject: this.serviceName,
                method: this.create.name,
            };
        }
        const artists = Object.assign(new artist_entity_1.Artist(), dto);
        return await this.artistsRepository.save(artists);
    }
    async addFollow(artists, topic, newFollow) {
        artists.follows.map(follow => (follow[topic] = [...follow[topic], newFollow]));
        return await this.artistsRepository.save(artists);
    }
    async findById(id) {
        return await this.artistsRepository.findOne(id);
    }
    async find(options) {
        return await this.artistsRepository.find(options);
    }
    async findOne(options) {
        return await this.artistsRepository.findOne(options);
    }
    async save(artist) {
        return await this.artistsRepository.save(artist);
    }
    async delete(id) {
        return await this.artistsRepository.delete(id);
    }
};
ArtistsService = ArtistsService_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(artist_entity_1.Artist, 'artist-db')),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ArtistsService);
exports.ArtistsService = ArtistsService;
//# sourceMappingURL=artists.service.js.map