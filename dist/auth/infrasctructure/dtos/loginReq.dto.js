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
exports.LoginReqDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const loginType_enum_1 = require("../../domain/enums/loginType.enum");
class LoginReqDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { identifier: { required: true, type: () => String }, password: { required: true, type: () => String }, loginType: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({
        example: 'lucas.henrydz@gmail.com | noname_eter',
        description: 'User Email or User Username',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LoginReqDto.prototype, "identifier", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: '1qaz2wsx',
        description: 'User Password',
    }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LoginReqDto.prototype, "password", void 0);
__decorate([
    swagger_1.ApiProperty({
        example: loginType_enum_1.LoginType.EMAIL,
        description: 'login type',
        enum: loginType_enum_1.LoginType,
    }),
    class_validator_1.IsString(),
    class_validator_1.IsIn(Object.keys(loginType_enum_1.LoginType)),
    __metadata("design:type", String)
], LoginReqDto.prototype, "loginType", void 0);
exports.LoginReqDto = LoginReqDto;
//# sourceMappingURL=loginReq.dto.js.map