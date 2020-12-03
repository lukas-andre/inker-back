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
exports.FollowerDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class FollowerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => Number }, userTypeId: { required: true, type: () => Number }, username: { required: true, type: () => String }, profileThumbnail: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({
        example: '41560',
        description: 'User Id',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", Number)
], FollowerDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: '415604',
        description: 'UserType Id, artist or customer Id',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", Number)
], FollowerDto.prototype, "userTypeId", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'lucas@gmail.com',
        description: 'User identifier',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], FollowerDto.prototype, "username", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'http://d2e2zqk24pso8s.cloudfront.net/artist/34dd0b7f-0846-4c31-9d83-8ea513e8a3fa/profile-picture_Sun',
        description: 'cloudfront url',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], FollowerDto.prototype, "profileThumbnail", void 0);
exports.FollowerDto = FollowerDto;
//# sourceMappingURL=follow.dto.js.map