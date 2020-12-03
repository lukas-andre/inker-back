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
exports.Follower = void 0;
const openapi = require("@nestjs/swagger");
const userType_enum_1 = require("../../../users/domain/enums/userType.enum");
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../global/infrastructure/entities/base.entity");
let Follower = class Follower extends base_entity_1.BaseEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { artistId: { required: true, type: () => Number }, userId: { required: true, type: () => Number }, userTypeId: { required: true, type: () => Number }, userType: { required: true, type: () => String }, username: { required: true, type: () => String }, fullname: { required: true, type: () => String }, profileThumbnail: { required: true, type: () => String } };
    }
};
__decorate([
    typeorm_1.Index(),
    typeorm_1.Column({ name: 'artist_id' }),
    __metadata("design:type", Number)
], Follower.prototype, "artistId", void 0);
__decorate([
    typeorm_1.Index(),
    typeorm_1.Column({ name: 'user_id' }),
    __metadata("design:type", Number)
], Follower.prototype, "userId", void 0);
__decorate([
    typeorm_1.Index(),
    typeorm_1.Column({ name: 'user_type_id' }),
    __metadata("design:type", Number)
], Follower.prototype, "userTypeId", void 0);
__decorate([
    typeorm_1.Column({ name: 'user_type', enum: userType_enum_1.UserType }),
    __metadata("design:type", String)
], Follower.prototype, "userType", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Follower.prototype, "username", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Follower.prototype, "fullname", void 0);
__decorate([
    typeorm_1.Column({ name: 'profile_thumbnail', nullable: true }),
    __metadata("design:type", String)
], Follower.prototype, "profileThumbnail", void 0);
Follower = __decorate([
    typeorm_1.Entity()
], Follower);
exports.Follower = Follower;
//# sourceMappingURL=follower.entity.js.map