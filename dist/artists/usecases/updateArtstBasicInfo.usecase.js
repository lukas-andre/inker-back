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
exports.UpdateArtistBasicInfoUseCase = void 0;
const common_1 = require("@nestjs/common");
const domainNotFound_exception_1 = require("../../global/domain/exceptions/domainNotFound.exception");
const artists_service_1 = require("../domain/services/artists.service");
let UpdateArtistBasicInfoUseCase = class UpdateArtistBasicInfoUseCase {
    constructor(aristsService) {
        this.aristsService = aristsService;
    }
    async execute(id, updateArtistDto) {
        const result = await this.aristsService.findById(id);
        if (!result) {
            return new domainNotFound_exception_1.DomainNotFoundException('Artist not found');
        }
        Object.assign(result, updateArtistDto);
        return this.aristsService.save(result);
    }
};
UpdateArtistBasicInfoUseCase = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [artists_service_1.ArtistsService])
], UpdateArtistBasicInfoUseCase);
exports.UpdateArtistBasicInfoUseCase = UpdateArtistBasicInfoUseCase;
//# sourceMappingURL=updateArtstBasicInfo.usecase.js.map