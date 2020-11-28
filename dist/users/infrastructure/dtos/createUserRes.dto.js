"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserResDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateUserResDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, username: { required: false, type: () => String }, email: { required: false, type: () => String }, active: { required: false, type: () => Boolean }, userType: { required: false, type: () => String }, role: { required: false, type: () => Object } };
    }
}
exports.CreateUserResDto = CreateUserResDto;
//# sourceMappingURL=createUserRes.dto.js.map