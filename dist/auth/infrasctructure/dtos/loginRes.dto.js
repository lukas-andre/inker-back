"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResDto = void 0;
const openapi = require("@nestjs/swagger");
const jwtPayload_interface_1 = require("../../../global/domain/interfaces/jwtPayload.interface");
const defaultLogin_result_1 = require("../../usecases/interfaces/defaultLogin.result");
class LoginResDto extends defaultLogin_result_1.DefaultLoginResult {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.LoginResDto = LoginResDto;
//# sourceMappingURL=loginRes.dto.js.map