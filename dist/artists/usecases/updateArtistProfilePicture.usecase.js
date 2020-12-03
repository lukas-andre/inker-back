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
exports.UpdateArtistProfilePictureUseCase = void 0;
const common_1 = require("@nestjs/common");
const artists_service_1 = require("../domain/services/artists.service");
const multimedias_service_1 = require("../../multimedias/services/multimedias.service");
const domainInternalServerError_exception_1 = require("../../global/domain/exceptions/domainInternalServerError.exception");
const domainNotFound_exception_1 = require("../../global/domain/exceptions/domainNotFound.exception");
let UpdateArtistProfilePictureUseCase = class UpdateArtistProfilePictureUseCase {
    constructor(artistsService, multimediasService) {
        this.artistsService = artistsService;
        this.multimediasService = multimediasService;
    }
    async execute(id, file) {
        if (!file)
            return new domainNotFound_exception_1.DomainNotFoundException('Not valid file to upload');
        console.log('id: ', id);
        console.log('file2: ', file);
        let artist;
        try {
            artist = await this.artistsService.findById(id);
        }
        catch (error) {
            return new domainInternalServerError_exception_1.DomainInternalServerErrorException(`Error: ${error}`);
        }
        console.log('artist: ', artist);
        if (!artist)
            return new domainNotFound_exception_1.DomainNotFoundException('Artists not found');
        const source = `artist/${id}`;
        const fileName = `profile-picture_${new Date()}`;
        console.time('uploadFile');
        const { aws, cloudFrontUrl } = await this.multimediasService.upload(file, source, fileName);
        console.timeEnd('uploadFile');
        artist.profileThumbnail = cloudFrontUrl;
        return await this.artistsService.save(artist);
    }
};
UpdateArtistProfilePictureUseCase = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [artists_service_1.ArtistsService,
        multimedias_service_1.MultimediasService])
], UpdateArtistProfilePictureUseCase);
exports.UpdateArtistProfilePictureUseCase = UpdateArtistProfilePictureUseCase;
//# sourceMappingURL=updateArtistProfilePicture.usecase.js.map