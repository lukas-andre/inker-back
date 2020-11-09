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
exports.CreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const userType_enum_1 = require("../enums/userType.enum");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { username: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, userType: { required: true, enum: require("../enums/userType.enum").UserType }, phoneNumber: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({
        example: 'noname_eter',
        description: 'User Username',
        required: false,
    }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'Lucas',
        description: 'First Name',
        required: false,
    }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'Henry',
        description: 'Last Name',
        required: false,
    }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: 'lucas.henry@inker.cloud',
        description: 'User Email',
        required: false,
    }),
    class_validator_1.IsEmail(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: '1qaz2wsx',
        description: 'User Passowrd',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: userType_enum_1.UserType.ARTIST,
        enum: [Object.keys(userType_enum_1.UserType)],
        description: 'User Type',
    }),
    class_validator_1.IsEnum(userType_enum_1.UserType),
    __metadata("design:type", String)
], CreateUserDto.prototype, "userType", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: '+56964484712',
        description: 'User phone numer',
        required: false,
    }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
exports.CreateUserDto = CreateUserDto;
//# sourceMappingURL=createUser.dto.js.map