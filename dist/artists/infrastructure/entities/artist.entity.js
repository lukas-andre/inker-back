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
exports.Artist = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const tag_entity_1 = require("./tag.entity");
const genders_entity_1 = require("./genders.entity");
const base_entity_1 = require("../../../global/infrastructure/entities/base.entity");
let Artist = class Artist extends base_entity_1.BaseEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => Number }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, contactEmail: { required: true, type: () => String }, contactPhoneNumber: { required: true, type: () => String }, shortDescription: { required: true, type: () => String }, profileThumbnail: { required: true, type: () => String }, tags: { required: true, type: () => [require("./tag.entity").Tag] }, genders: { required: true, type: () => [require("./genders.entity").Gender] }, rating: { required: true, type: () => Number } };
    }
};
__decorate([
    typeorm_1.Column({ name: 'user_id' }),
    __metadata("design:type", Number)
], Artist.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column({ name: 'first_name', nullable: true }),
    __metadata("design:type", String)
], Artist.prototype, "firstName", void 0);
__decorate([
    typeorm_1.Column({ name: 'last_name', nullable: true }),
    __metadata("design:type", String)
], Artist.prototype, "lastName", void 0);
__decorate([
    typeorm_1.Column({ name: 'contact_email', nullable: true }),
    __metadata("design:type", String)
], Artist.prototype, "contactEmail", void 0);
__decorate([
    typeorm_1.Column({ name: 'contact_phone_number', nullable: true }),
    __metadata("design:type", String)
], Artist.prototype, "contactPhoneNumber", void 0);
__decorate([
    typeorm_1.Column({ name: 'short_description', nullable: true }),
    __metadata("design:type", String)
], Artist.prototype, "shortDescription", void 0);
__decorate([
    typeorm_1.Column({ name: 'profile_thumbnail', nullable: true }),
    __metadata("design:type", String)
], Artist.prototype, "profileThumbnail", void 0);
__decorate([
    typeorm_1.ManyToMany(() => tag_entity_1.Tag),
    typeorm_1.JoinTable({ name: 'artist_tags' }),
    __metadata("design:type", Array)
], Artist.prototype, "tags", void 0);
__decorate([
    typeorm_1.ManyToMany(() => genders_entity_1.Gender),
    typeorm_1.JoinTable({ name: 'artist_genders' }),
    __metadata("design:type", Array)
], Artist.prototype, "genders", void 0);
__decorate([
    typeorm_1.Column({ type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], Artist.prototype, "rating", void 0);
Artist = __decorate([
    typeorm_1.Entity()
], Artist);
exports.Artist = Artist;
//# sourceMappingURL=artist.entity.js.map