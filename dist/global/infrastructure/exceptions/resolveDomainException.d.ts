import { ConflictException, NotFoundException } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
export declare const resolveDomainException: (domainException: DomainException) => NotFoundException | ConflictException;
