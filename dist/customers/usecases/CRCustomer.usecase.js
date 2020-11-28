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
exports.CRCustomerUseCase = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("../domain/customers.service");
const serviceErrorStringify_1 = require("../../global/domain/utils/serviceErrorStringify");
const serviceError_1 = require("../../global/domain/interfaces/serviceError");
let CRCustomerUseCase = class CRCustomerUseCase {
    constructor(customersService) {
        this.customersService = customersService;
    }
    async create(params) {
        const created = await this.customersService.create(params);
        if (created instanceof serviceError_1.ServiceError) {
            throw new common_1.ConflictException(serviceErrorStringify_1.serviceErrorStringify(created));
        }
        return created;
    }
    async findOne(options) {
        return this.customersService.findOne(options);
    }
    async findAll(options) {
        return this.customersService.find(options);
    }
    async findById(id) {
        return this.customersService.findById(id);
    }
};
CRCustomerUseCase = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CRCustomerUseCase);
exports.CRCustomerUseCase = CRCustomerUseCase;
//# sourceMappingURL=CRCustomer.usecase.js.map