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
var FindArtistFollowersUseCases_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindArtistFollowersUseCases = void 0;
const common_1 = require("@nestjs/common");
const domainNotFound_exception_1 = require("../../global/domain/exceptions/domainNotFound.exception");
const artists_service_1 = require("../domain/services/artists.service");
const followers_service_1 = require("../domain/services/followers.service");
let FindArtistFollowersUseCases = FindArtistFollowersUseCases_1 = class FindArtistFollowersUseCases {
    constructor(artistsService, followersService) {
        this.artistsService = artistsService;
        this.followersService = followersService;
        this.logger = new common_1.Logger(FindArtistFollowersUseCases_1.name);
    }
    async execute(artistId) {
        let result;
        if (!await this.artistsService.existArtist(artistId)) {
            result = new domainNotFound_exception_1.DomainNotFoundException('Artist not found');
        }
        result = await this.followersService.find({
            select: [
                'artistId',
                'fullname',
                'profileThumbnail',
                'userId',
                'userType',
                'userTypeId',
                'username',
            ],
            where: {
                artistId,
            },
        });
        this.logger.log(`FindArtistFollowersUseCases result: ${JSON.stringify(result)}`);
        return result;
    }
};
FindArtistFollowersUseCases = FindArtistFollowersUseCases_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [artists_service_1.ArtistsService,
        followers_service_1.FollowersService])
], FindArtistFollowersUseCases);
exports.FindArtistFollowersUseCases = FindArtistFollowersUseCases;
//# sourceMappingURL=findArtistFollowers.usecases copy.js.map