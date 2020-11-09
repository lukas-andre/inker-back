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
exports.CreateCustomerDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCustomerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, contactEmail: { required: false, type: () => String }, phoneNumber: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({
        example: '415604a6-6db4-4a3b-a1dc-470193485b91',
        description: 'User Id',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'Lucas',
        description: 'First Name',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "firstName", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'Henry',
        description: 'Last Name',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "lastName", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'test@inker.cl',
        description: 'Customer contact email',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "contactEmail", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: '+56964484712',
        description: 'Customer phone numer',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phoneNumber", void 0);
exports.CreateCustomerDto = CreateCustomerDto;
//# sourceMappingURL=createCustomer.dto.js.map