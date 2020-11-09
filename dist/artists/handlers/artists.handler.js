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
exports.ArtistsHandler = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const artists_service_1 = require("../services/artists.service");
const serviceErrorStringify_1 = require("../../global/utils/serviceErrorStringify");
const serviceError_1 = require("../../global/interfaces/serviceError");
const multimedias_service_1 = require("../../multimedias/services/multimedias.service");
let ArtistsHandler = class ArtistsHandler {
    constructor(artistsService, multimediasService, configService) {
        this.artistsService = artistsService;
        this.multimediasService = multimediasService;
        this.configService = configService;
    }
    async handleCreate(createArtistdto) {
        const created = await this.artistsService.create(createArtistdto);
        if (created instanceof serviceError_1.ServiceError) {
            throw new common_1.ConflictException(serviceErrorStringify_1.serviceErrorStringify(created));
        }
        return created;
    }
    async handleSetProfileProflePicture(id, file) {
        const artist = await this.artistsService.findById(id);
        if (!artist)
            throw new common_1.NotFoundException('Artists not found');
        const source = `artist/${artist.id}`;
        const fileName = 'profile-picture';
        const result = await this.multimediasService.upload(file, source, fileName);
        artist.profileThumbnail = result.Key;
        return await this.artistsService.save(artist);
    }
    async handleGetAll() {
        return await this.artistsService.find({});
    }
};
ArtistsHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [artists_service_1.ArtistsService,
        multimedias_service_1.MultimediasService,
        config_1.ConfigService])
], ArtistsHandler);
exports.ArtistsHandler = ArtistsHandler;
//# sourceMappingURL=artists.handler.js.map