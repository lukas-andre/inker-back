"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistsModule = void 0;
const common_1 = require("@nestjs/common");
const artists_service_1 = require("./domain/services/artists.service");
const artists_controller_1 = require("./infrastructure/artists.controller");
const artist_entity_1 = require("./infrastructure/entities/artist.entity");
const typeorm_1 = require("@nestjs/typeorm");
const artists_handler_1 = require("./infrastructure/artists.handler");
const multimedias_module_1 = require("../multimedias/multimedias.module");
const createArtist_usecase_1 = require("./usecases/createArtist.usecase");
const findArtist_usecases_1 = require("./usecases/findArtist.usecases");
const updateArtistProfilePicture_usecase_1 = require("./usecases/updateArtistProfilePicture.usecase");
const updateArtstBasicInfo_usecase_1 = require("./usecases/updateArtstBasicInfo.usecase");
let ArtistsModule = class ArtistsModule {
};
ArtistsModule = __decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forFeature([artist_entity_1.Artist], 'artist-db'), multimedias_module_1.MultimediasModule],
        providers: [
            artists_service_1.ArtistsService,
            artists_handler_1.ArtistsHandler,
            createArtist_usecase_1.CreateArtistUseCase,
            findArtist_usecases_1.FindArtistsUseCases,
            updateArtistProfilePicture_usecase_1.UpdateArtistProfilePictureUseCase,
            updateArtstBasicInfo_usecase_1.UpdateArtistBasicInfoUseCase
        ],
        controllers: [artists_controller_1.ArtistsController],
        exports: [artists_service_1.ArtistsService],
    })
], ArtistsModule);
exports.ArtistsModule = ArtistsModule;
//# sourceMappingURL=artists.module.js.map