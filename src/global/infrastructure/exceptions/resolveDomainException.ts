import { ConflictException, NotFoundException } from '@nestjs/common';
import { DomainConflictException } from '../../domain/exceptions/domainConflict.exception';
import { DomainNotFoundException } from '../../domain/exceptions/domainNotFound.exception';
import { DomainException } from '../../domain/exceptions/domain.exception';

export const resolveDomainException = (domainException: DomainException) => {
  if (domainException instanceof DomainConflictException)
    return new ConflictException(domainException.response);
  if (domainException instanceof DomainNotFoundException)
    return new NotFoundException(domainException.response);
};
