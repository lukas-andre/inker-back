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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const customer_entity_1 = require("../infrastructure/entities/customer.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let CustomersService = CustomersService_1 = class CustomersService {
    constructor(customersRepository) {
        this.customersRepository = customersRepository;
        this.serviceName = CustomersService_1.name;
    }
    async create(pararms) {
        const exists = await this.customersRepository.findOne({
            userId: pararms.userId,
        });
        if (exists) {
            return {
                error: `Customer with user id: ${pararms.userId} already exist`,
                subject: this.serviceName,
                method: this.create.name,
            };
        }
        const newCustomer = Object.assign(new customer_entity_1.Customer());
        return await this.customersRepository.save(newCustomer);
    }
    async addFollow(customer, topic, newFollow) {
        customer.follows.map(follow => (follow[topic] = [...follow[topic], newFollow]));
        return await this.customersRepository.save(customer);
    }
    async findById(id) {
        return await this.customersRepository.findOne(id);
    }
    async find(options) {
        return await this.customersRepository.find(options);
    }
    async findOne(options) {
        return await this.customersRepository.findOne(options);
    }
    async save(customer) {
        return await this.customersRepository.save(customer);
    }
    async delete(id) {
        return await this.customersRepository.delete(id);
    }
};
CustomersService = CustomersService_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(customer_entity_1.Customer, 'customer-db')),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
exports.CustomersService = CustomersService;
//# sourceMappingURL=customers.service.js.map