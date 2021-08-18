import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { DomainConflictException } from '../../domain/exceptions/domainConflict.exception';
import { DomainInternalServerErrorException } from '../../domain/exceptions/domainInternalServerError.exception';
import { DomainNotFoundException } from '../../domain/exceptions/domainNotFound.exception';

export const resolveDomainException = (domainException: DomainException) => {
  if (domainException instanceof DomainConflictException)
    return new ConflictException(domainException.response);
  if (domainException instanceof DomainNotFoundException)
    return new NotFoundException(domainException.response);
  if (domainException instanceof DomainInternalServerErrorException)
    return new InternalServerErrorException(domainException.response);
};
