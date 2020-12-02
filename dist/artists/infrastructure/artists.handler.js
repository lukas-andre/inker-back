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
const createArtist_usecase_1 = require("../usecases/createArtist.usecase");
const findArtist_usecases_1 = require("../usecases/findArtist.usecases");
const updateArtistProfilePicture_usecase_1 = require("../usecases/updateArtistProfilePicture.usecase");
const domain_exception_1 = require("../../global/domain/exceptions/domain.exception");
const resolveDomainException_1 = require("../../global/infrastructure/exceptions/resolveDomainException");
const updateArtstBasicInfo_usecase_1 = require("../usecases/updateArtstBasicInfo.usecase");
const jwt_1 = require("@nestjs/jwt");
const jwtPayload_interface_1 = require("../../global/domain/interfaces/jwtPayload.interface");
const followArtist_usecase_1 = require("../usecases/followArtist.usecase");
const unfollowArtist_usecase_1 = require("../usecases/unfollowArtist.usecase");
const base_handler_1 = require("../../global/infrastructure/base.handler");
let ArtistsHandler = class ArtistsHandler extends base_handler_1.BaseHandler {
    constructor(createArtistUseCase, findArtistsUseCases, updateArtistProfilePictureUseCase, updateArtistBasicInfoUseCase, followUseCase, unfollowArtistUseCase, jwtService) {
        super(jwtService);
        this.createArtistUseCase = createArtistUseCase;
        this.findArtistsUseCases = findArtistsUseCases;
        this.updateArtistProfilePictureUseCase = updateArtistProfilePictureUseCase;
        this.updateArtistBasicInfoUseCase = updateArtistBasicInfoUseCase;
        this.followUseCase = followUseCase;
        this.unfollowArtistUseCase = unfollowArtistUseCase;
        this.jwtService = jwtService;
    }
    async handleCreate(dto) {
        return this.resolve(await this.createArtistUseCase.execute(dto));
    }
    async handleUpdateProfileProflePicture(id, file) {
        return this.resolve(await this.updateArtistProfilePictureUseCase.execute(id, file));
    }
    async handleFindById(id) {
        return this.findArtistsUseCases.findById(id);
    }
    async handleGetAll() {
        return this.findArtistsUseCases.findAll({});
    }
    async handleUpdateArtistBasicInfo(id, dto) {
        return this.resolve(await this.updateArtistBasicInfoUseCase.execute(id, dto));
    }
    async handleFollow(id, request) {
        const jwtPayload = this.getJwtPayloadFromRequest(request);
        const params = {
            userId: jwtPayload.id,
            userTypeId: jwtPayload.userTypeId,
            username: jwtPayload.username,
            profileThumbnail: jwtPayload.profileThumbnail
                ? jwtPayload.profileThumbnail
                : '',
        };
        return this.resolve(await this.followUseCase.execute(id, params));
    }
    async handleUnfollow(id, request) {
        const jwtPayload = this.getJwtPayloadFromRequest(request);
        return this.resolve(await this.unfollowArtistUseCase.execute(id, jwtPayload.id));
    }
};
ArtistsHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [createArtist_usecase_1.CreateArtistUseCase,
        findArtist_usecases_1.FindArtistsUseCases,
        updateArtistProfilePicture_usecase_1.UpdateArtistProfilePictureUseCase,
        updateArtstBasicInfo_usecase_1.UpdateArtistBasicInfoUseCase,
        followArtist_usecase_1.FollowUseCase,
        unfollowArtist_usecase_1.UnfollowArtistUseCase,
        jwt_1.JwtService])
], ArtistsHandler);
exports.ArtistsHandler = ArtistsHandler;
//# sourceMappingURL=artists.handler.js.map