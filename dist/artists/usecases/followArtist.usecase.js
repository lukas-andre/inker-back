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
exports.FollowUseCase = void 0;
const common_1 = require("@nestjs/common");
const domainConflict_exception_1 = require("../../global/domain/exceptions/domainConflict.exception");
const domainInternalServerError_exception_1 = require("../../global/domain/exceptions/domainInternalServerError.exception");
const typeorm_1 = require("typeorm");
const domain_exception_1 = require("../../global/domain/exceptions/domain.exception");
const artists_service_1 = require("../domain/services/artists.service");
const followers_service_1 = require("../domain/services/followers.service");
const follower_entity_1 = require("../infrastructure/entities/follower.entity");
let FollowUseCase = class FollowUseCase {
    constructor(followersService, artistsService) {
        this.followersService = followersService;
        this.artistsService = artistsService;
    }
    async execute(id, followParams) {
        let result;
        const connection = typeorm_1.getConnection('artist-db');
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        if (!(await this.artistsService.existArtist(id))) {
            return new domainConflict_exception_1.DomainConflictException('Artist not exists');
        }
        if (await this.followersService.existFollower(id, followParams.userId)) {
            return new domainConflict_exception_1.DomainConflictException('Follower already exists');
        }
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.save(follower_entity_1.Follower, Object.assign({ artistId: id }, Object.assign(new follower_entity_1.Follower(), followParams)));
            await queryRunner.commitTransaction();
        }
        catch (error) {
            result = new domainInternalServerError_exception_1.DomainInternalServerErrorException('Fail follow transaction');
            await queryRunner.rollbackTransaction();
        }
        finally {
            await queryRunner.release();
        }
        return result instanceof domain_exception_1.DomainException ? result : true;
    }
};
FollowUseCase = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [followers_service_1.FollowersService,
        artists_service_1.ArtistsService])
], FollowUseCase);
exports.FollowUseCase = FollowUseCase;
//# sourceMappingURL=followArtist.usecase.js.map