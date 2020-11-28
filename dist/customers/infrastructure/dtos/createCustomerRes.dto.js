"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerResDto = void 0;
const openapi = require("@nestjs/swagger");
const customer_entity_1 = require("../entities/customer.entity");
class CreateCustomerResDto extends customer_entity_1.Customer {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.CreateCustomerResDto = CreateCustomerResDto;
//# sourceMappingURL=createCustomerRes.dto.js.map