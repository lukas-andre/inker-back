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
exports.UpdateArtistDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const createArtist_dto_1 = require("./createArtist.dto");
class UpdateArtistDto extends swagger_1.PartialType(swagger_1.OmitType(createArtist_dto_1.CreateArtistDto, ['userId', 'phoneNumber'])) {
    static _OPENAPI_METADATA_FACTORY() {
        return { shortDescription: { required: true, type: () => String }, contactPhoneNumber: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({
        example: 'This is my inker studio, wecolme',
        description: 'description for artist studio profile',
        required: false,
    }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateArtistDto.prototype, "shortDescription", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: '+56974448339',
        description: 'Artist Contact Number',
        required: false,
    }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateArtistDto.prototype, "contactPhoneNumber", void 0);
exports.UpdateArtistDto = UpdateArtistDto;
//# sourceMappingURL=updateArtist.dto.js.map