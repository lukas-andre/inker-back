import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DomainConflictException } from '../../domain/exceptions/domainConflict.exception';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { DomainNotFoundException } from 'src/global/domain/exceptions/domainNotFound.exception copy';
import { DomainInternalServerErrorException } from 'src/global/domain/exceptions/domainInternalServerError.exception';

export const resolveDomainException = (domainException: DomainException) => {
  if (domainException instanceof DomainConflictException)
    return new ConflictException(domainException.response);
  if (domainException instanceof DomainNotFoundException)
    return new NotFoundException(domainException.response);
  if (domainException instanceof DomainInternalServerErrorException)
    return new InternalServerErrorException(domainException.response);
};
