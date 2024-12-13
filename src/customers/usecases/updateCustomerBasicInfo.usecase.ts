import { Injectable } from "@nestjs/common";
import { CustomerProvider } from "../infrastructure/providers/customer.provider";
import { BaseUseCase, UseCase } from "../../global/domain/usecases/base.usecase";
import { UpdateCustomerDto } from "../infrastructure/dtos/updateCustomerReq.dto";
import { Customer } from "../infrastructure/entities/customer.entity";
import { DomainNotFound } from "src/global/domain/exceptions/domain.exception";

@Injectable()
export class UpdateCustomerBasicInfoUseCase extends BaseUseCase implements UseCase {
    constructor(private readonly customerProvider: CustomerProvider) {
        super(UpdateCustomerBasicInfoUseCase.name);
    }

    async execute(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.customerProvider.findOne({
            where: { id },
        });

        if (!customer) {
            throw new DomainNotFound('Customer not found');
        }

        // Update only allowed fields
        if (updateCustomerDto.firstName) customer.firstName = updateCustomerDto.firstName;
        if (updateCustomerDto.lastName) customer.lastName = updateCustomerDto.lastName;
        if (updateCustomerDto.shortDescription) customer.shortDescription = updateCustomerDto.shortDescription;
        if (updateCustomerDto.contactEmail) customer.contactEmail = updateCustomerDto.contactEmail;
        if (updateCustomerDto.contactPhoneNumber) customer.contactPhoneNumber = updateCustomerDto.contactPhoneNumber;

        const updatedCustomer = await this.customerProvider.save(customer);

        return updatedCustomer;
    }
}