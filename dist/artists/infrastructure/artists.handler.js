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
let ArtistsHandler = class ArtistsHandler {
    constructor(createArtistUseCase, findArtistsUseCases, updateArtistProfilePictureUseCase) {
        this.createArtistUseCase = createArtistUseCase;
        this.findArtistsUseCases = findArtistsUseCases;
        this.updateArtistProfilePictureUseCase = updateArtistProfilePictureUseCase;
    }
    async handleCreate(createArtistdto) {
        const created = await this.createArtistUseCase.execute(createArtistdto);
        if (created instanceof domain_exception_1.DomainException) {
            throw resolveDomainException_1.resolveDomainException(created);
        }
        return created;
    }
    async handleSetProfileProflePicture(id, file) {
        const result = await this.updateArtistProfilePictureUseCase.execute(id, file);
        if (result instanceof domain_exception_1.DomainException)
            throw resolveDomainException_1.resolveDomainException(result);
        return result;
    }
    async handleFindById(id) {
        return await this.findArtistsUseCases.findById(id);
    }
    async handleGetAll() {
        return await this.findArtistsUseCases.findAll({});
    }
};
ArtistsHandler = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [createArtist_usecase_1.CreateArtistUseCase,
        findArtist_usecases_1.FindArtistsUseCases,
        updateArtistProfilePicture_usecase_1.UpdateArtistProfilePictureUseCase])
], ArtistsHandler);
exports.ArtistsHandler = ArtistsHandler;
//# sourceMappingURL=artists.handler.js.map