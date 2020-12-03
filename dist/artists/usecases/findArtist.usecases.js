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
exports.FindArtistsUseCases = void 0;
const common_1 = require("@nestjs/common");
const artists_service_1 = require("../domain/services/artists.service");
const followers_service_1 = require("../domain/services/followers.service");
const domainNotFound_exception_1 = require("../../global/domain/exceptions/domainNotFound.exception");
let FindArtistsUseCases = class FindArtistsUseCases {
    constructor(artistsService, followersService) {
        this.artistsService = artistsService;
        this.followersService = followersService;
    }
    async findById(id) {
        let result;
        result = await this.artistsService.findById(id);
        if (!result) {
            return new domainNotFound_exception_1.DomainNotFoundException('Artist not found');
        }
        result.followers = await this.followersService.countFollowers(result.id);
        return result;
    }
    async findOne(options) {
        return await this.artistsService.findOne(options);
    }
    async findAll(options) {
        return await this.artistsService.find(options);
    }
};
FindArtistsUseCases = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [artists_service_1.ArtistsService, followers_service_1.FollowersService])
], FindArtistsUseCases);
exports.FindArtistsUseCases = FindArtistsUseCases;
//# sourceMappingURL=findArtist.usecases.js.map