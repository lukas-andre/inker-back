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
const passport_jwt_1 = require("passport-jwt");
const jwtPayload_interface_1 = require("../../auth/domain/interfaces/jwtPayload.interface");
let ArtistsHandler = class ArtistsHandler {
    constructor(createArtistUseCase, findArtistsUseCases, updateArtistProfilePictureUseCase, updateArtistBasicInfoUseCase, jwtService) {
        this.createArtistUseCase = createArtistUseCase;
        this.findArtistsUseCases = findArtistsUseCases;
        this.updateArtistProfilePictureUseCase = updateArtistProfilePictureUseCase;
        this.updateArtistBasicInfoUseCase = updateArtistBasicInfoUseCase;
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
    resolve(result) {
        if (result instanceof domain_exception_1.DomainException)
            throw resolveDomainException_1.resolveDomainException(result);
        return result;
    }
    async handleFollow(id, request) {
        const jwt = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        const payload = this.jwtService.verify(jwt);
        console.log('payload: ', payload);
    }
};
ArtistsHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [createArtist_usecase_1.CreateArtistUseCase,
        findArtist_usecases_1.FindArtistsUseCases,
        updateArtistProfilePicture_usecase_1.UpdateArtistProfilePictureUseCase,
        updateArtstBasicInfo_usecase_1.UpdateArtistBasicInfoUseCase,
        jwt_1.JwtService])
], ArtistsHandler);
exports.ArtistsHandler = ArtistsHandler;
//# sourceMappingURL=artists.handler.js.map