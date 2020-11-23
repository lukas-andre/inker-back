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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const artists_handler_1 = require("../handlers/artists.handler");
const createArtist_dto_1 = require("../dtos/createArtist.dto");
const platform_express_1 = require("@nestjs/platform-express");
const artist_entity_1 = require("../entities/artist.entity");
const fileUpload_dto_1 = require("../../multimedias/dtos/fileUpload.dto");
let ArtistsController = class ArtistsController {
    constructor(artistHandler) {
        this.artistHandler = artistHandler;
    }
    async create(createArtistDto) {
        return await this.artistHandler.handleCreate(createArtistDto);
    }
    async setProfileProflePicture(file, id) {
        return await this.artistHandler.handleSetProfileProflePicture(id, file);
    }
    async getAllArtists() {
        return this.artistHandler.handleGetAll();
    }
    async getArtistById(id) {
        console.log(id);
        return this.artistHandler.handleFindById(id);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Create Artist' }),
    swagger_1.ApiCreatedResponse({ description: 'Artist has been created', type: artist_entity_1.Artist }),
    swagger_1.ApiConflictResponse({ description: 'Artist already exists' }),
    common_1.Post(),
    openapi.ApiResponse({ status: 201, type: require("../entities/artist.entity").Artist }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createArtist_dto_1.CreateArtistDto]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "create", null);
__decorate([
    swagger_1.ApiConsumes('multipart/form-data'),
    swagger_1.ApiBody({ description: 'profile picture', type: fileUpload_dto_1.FileUploadDto }),
    swagger_1.ApiCreatedResponse({
        description: 'Artist profile picture was uploaded',
        type: artist_entity_1.Artist,
    }),
    common_1.Post('/:id/profile-picture'),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('file')),
    openapi.ApiResponse({ status: 201, type: require("../entities/artist.entity").Artist }),
    __param(0, common_1.UploadedFile()), __param(1, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "setProfileProflePicture", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get all Artists' }),
    swagger_1.ApiOkResponse({
        description: 'Get all artists ok',
        isArray: true,
        type: artist_entity_1.Artist,
    }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: [require("../entities/artist.entity").Artist] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "getAllArtists", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get Artist by Id' }),
    swagger_1.ApiOkResponse({
        description: 'Get artist ok',
        type: artist_entity_1.Artist,
    }),
    swagger_1.ApiParam({ name: 'id', required: true }),
    common_1.Get(':id'),
    openapi.ApiResponse({ status: 200, type: require("../entities/artist.entity").Artist }),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "getArtistById", null);
ArtistsController = __decorate([
    swagger_1.ApiTags('artists'),
    common_1.Controller('artist'),
    __metadata("design:paramtypes", [artists_handler_1.ArtistsHandler])
], ArtistsController);
exports.ArtistsController = ArtistsController;
//# sourceMappingURL=artists.controller.js.map