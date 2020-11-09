"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const artist_entity_1 = require("../../artists/entities/artist.entity");
const userType_enum_1 = require("../../users/enums/userType.enum");
let AuthService = class AuthService {
    generateJwtByUserType(userType, user, entity) {
        console.log(`entity: ${entity}`);
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            userType: userType_enum_1.UserType[userType],
            permision: user.role.permissions.map(permission => ({
                c: permission.controller,
                a: permission.action,
            })),
        };
    }
};
AuthService = __decorate([
    common_1.Injectable()
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map