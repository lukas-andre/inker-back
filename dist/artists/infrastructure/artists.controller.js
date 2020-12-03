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
const artists_handler_1 = require("./artists.handler");
const createArtist_dto_1 = require("./dtos/createArtist.dto");
const platform_express_1 = require("@nestjs/platform-express");
const fileUpload_dto_1 = require("../../multimedias/dtos/fileUpload.dto");
const baseArtistResponse_dto_1 = require("./dtos/baseArtistResponse.dto");
const updateArtist_dto_1 = require("./dtos/updateArtist.dto");
const auth_guard_1 = require("../../global/infrastructure/guards/auth.guard");
let ArtistsController = class ArtistsController {
    constructor(artistHandler) {
        this.artistHandler = artistHandler;
    }
    async create(createArtistDto) {
        return this.artistHandler.handleCreate(createArtistDto);
    }
    async updateProfileProflePicture(file, id) {
        console.log('file: ', file);
        return this.artistHandler.handleUpdateProfileProflePicture(id, file);
    }
    async findAllArtists() {
        return this.artistHandler.handleGetAll();
    }
    async findArtistById(id) {
        console.log(id);
        return this.artistHandler.handleFindById(id);
    }
    async updateArtistBasicInfo(id, body) {
        return this.artistHandler.handleUpdateArtistBasicInfo(id, body);
    }
    async follow(id, request) {
        return this.artistHandler.handleFollow(id, request);
    }
    async unfollow(id, request) {
        return this.artistHandler.handleUnfollow(id, request);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Create Artist' }),
    swagger_1.ApiCreatedResponse({
        description: 'Artist has been created',
        type: baseArtistResponse_dto_1.BaseArtistResponse,
    }),
    swagger_1.ApiConflictResponse({ description: 'Artist already exists' }),
    common_1.Post(),
    openapi.ApiResponse({ status: 201, type: require("./dtos/baseArtistResponse.dto").BaseArtistResponse }),
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
        type: baseArtistResponse_dto_1.BaseArtistResponse,
    }),
    swagger_1.ApiParam({ name: 'id', required: true, type: Number }),
    common_1.Post('/:id/profile-picture'),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('file')),
    openapi.ApiResponse({ status: 201, type: require("./dtos/baseArtistResponse.dto").BaseArtistResponse }),
    __param(0, common_1.UploadedFile()),
    __param(1, common_1.Param('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "updateProfileProflePicture", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Find all Artists' }),
    swagger_1.ApiOkResponse({
        description: 'Get all artists ok',
        isArray: true,
        type: baseArtistResponse_dto_1.BaseArtistResponse,
    }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: [require("./dtos/baseArtistResponse.dto").BaseArtistResponse] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "findAllArtists", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Find Artist by Id' }),
    swagger_1.ApiOkResponse({
        description: 'Find artist ok',
        type: baseArtistResponse_dto_1.BaseArtistResponse,
    }),
    swagger_1.ApiParam({ name: 'id', required: true, type: Number }),
    common_1.Get(':id'),
    openapi.ApiResponse({ status: 200, type: require("./dtos/baseArtistResponse.dto").BaseArtistResponse }),
    __param(0, common_1.Param('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "findArtistById", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Update Artist Basic by Id' }),
    swagger_1.ApiOkResponse({
        description: 'Update artist ok',
        type: baseArtistResponse_dto_1.BaseArtistResponse,
    }),
    swagger_1.ApiParam({ name: 'id', required: true, type: Number }),
    common_1.Put(':id'),
    openapi.ApiResponse({ status: 200, type: require("./dtos/baseArtistResponse.dto").BaseArtistResponse }),
    __param(0, common_1.Param('id', common_1.ParseIntPipe)),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, updateArtist_dto_1.UpdateArtistDto]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "updateArtistBasicInfo", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Add follow' }),
    swagger_1.ApiOkResponse({
        description: 'Follow ok',
        type: Boolean,
    }),
    swagger_1.ApiParam({ name: 'id', required: true, type: Number }),
    common_1.Post(':id/follow'),
    openapi.ApiResponse({ status: 201, type: Boolean }),
    __param(0, common_1.Param('id', common_1.ParseIntPipe)), __param(1, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "follow", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Unfollow' }),
    swagger_1.ApiOkResponse({
        description: 'Unfollow ok',
        type: Boolean,
    }),
    swagger_1.ApiParam({ name: 'id', required: true, type: Number }),
    common_1.Post(':id/unfollow'),
    openapi.ApiResponse({ status: 201, type: Boolean }),
    __param(0, common_1.Param('id', common_1.ParseIntPipe)), __param(1, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ArtistsController.prototype, "unfollow", null);
ArtistsController = __decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags('artists'),
    common_1.Controller('artist'),
    common_1.UseGuards(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [artists_handler_1.ArtistsHandler])
], ArtistsController);
exports.ArtistsController = ArtistsController;
//# sourceMappingURL=artists.controller.js.map