import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { DomainBadRule } from '../../domain/exceptions/domainBadRule.exception';
import { DomainConflictException } from '../../domain/exceptions/domainConflict.exception';
import { DomainInternalServerErrorException } from '../../domain/exceptions/domainInternalServerError.exception';
import { DomainNotFoundException } from '../../domain/exceptions/domainNotFound.exception';
import { UnprocessableDomainException } from '../../domain/exceptions/unprocessableDomain.exception';

export const resolveDomainException = (domainException: DomainException) => {
  if (domainException instanceof DomainConflictException)
    return new ConflictException(domainException.response);
  if (domainException instanceof DomainNotFoundException)
    return new NotFoundException(domainException.response);
  if (domainException instanceof DomainInternalServerErrorException)
    return new InternalServerErrorException(domainException.response);
  if (domainException instanceof DomainBadRule)
    return new BadRequestException(domainException.response);
  if (domainException instanceof UnprocessableDomainException)
    return new UnprocessableEntityException(domainException.response);
};
