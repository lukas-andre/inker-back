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
exports.Customer = void 0;
const openapi = require("@nestjs/swagger");
const base_entity_1 = require("../../../global/infrastructure/entities/base.entity");
const typeorm_1 = require("typeorm");
let Customer = class Customer extends base_entity_1.BaseEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, contactEmail: { required: true, type: () => String }, contactPhoneNumber: { required: true, type: () => String }, shortDescription: { required: true, type: () => String }, profileThumbnail: { required: true, type: () => String }, follows: { required: true, type: () => [Object] }, rating: { required: true, type: () => Number } };
    }
};
__decorate([
    typeorm_1.Column({ name: 'user_id' }),
    __metadata("design:type", String)
], Customer.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column({ name: 'first_name', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "firstName", void 0);
__decorate([
    typeorm_1.Column({ name: 'last_name', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "lastName", void 0);
__decorate([
    typeorm_1.Column({ name: 'contact_email', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "contactEmail", void 0);
__decorate([
    typeorm_1.Column({ name: 'contact_phone_number', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "contactPhoneNumber", void 0);
__decorate([
    typeorm_1.Column({ name: 'short_description', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "shortDescription", void 0);
__decorate([
    typeorm_1.Column({ name: 'profile_thumbnail', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "profileThumbnail", void 0);
__decorate([
    typeorm_1.Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "follows", void 0);
__decorate([
    typeorm_1.Column({ type: 'float', default: 0.0 }),
    __metadata("design:type", Number)
], Customer.prototype, "rating", void 0);
Customer = __decorate([
    typeorm_1.Entity()
], Customer);
exports.Customer = Customer;
//# sourceMappingURL=customer.entity.js.map