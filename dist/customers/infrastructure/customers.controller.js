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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const createCustomerReq_dto_1 = require("./dtos/createCustomerReq.dto");
const customers_handler_1 = require("./customers.handler");
const createCustomerRes_dto_1 = require("./dtos/createCustomerRes.dto");
let CustomersController = class CustomersController {
    constructor(customerHandler) {
        this.customerHandler = customerHandler;
    }
    async create(createCustomerDto) {
        return await this.customerHandler.handleCreate(createCustomerDto);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Create Customer' }),
    swagger_1.ApiCreatedResponse({
        description: 'Users has been created',
        type: createCustomerRes_dto_1.CreateCustomerResDto,
    }),
    swagger_1.ApiNotFoundResponse({ description: 'Rolo does not exists' }),
    swagger_1.ApiConflictResponse({ description: 'Users already exists' }),
    common_1.Post(),
    openapi.ApiResponse({ status: 201, type: require("./entities/customer.entity").Customer }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createCustomerReq_dto_1.CreateCustomerReqDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
CustomersController = __decorate([
    swagger_1.ApiTags('customers'),
    common_1.Controller('customers'),
    __metadata("design:paramtypes", [customers_handler_1.CustomerHandler])
], CustomersController);
exports.CustomersController = CustomersController;
//# sourceMappingURL=customers.controller.js.map