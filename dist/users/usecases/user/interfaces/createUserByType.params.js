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
exports.CreateUserByTypeParams = void 0;
const userType_enum_1 = require("../../../domain/enums/userType.enum");
const class_validator_1 = require("class-validator");
class CreateUserByTypeParams {
}
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserByTypeParams.prototype, "username", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserByTypeParams.prototype, "firstName", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserByTypeParams.prototype, "lastName", void 0);
__decorate([
    class_validator_1.IsEmail(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserByTypeParams.prototype, "email", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateUserByTypeParams.prototype, "password", void 0);
__decorate([
    class_validator_1.IsEnum(userType_enum_1.UserType),
    __metadata("design:type", String)
], CreateUserByTypeParams.prototype, "userType", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateUserByTypeParams.prototype, "phoneNumber", void 0);
exports.CreateUserByTypeParams = CreateUserByTypeParams;
//# sourceMappingURL=createUserByType.params.js.map