import { ServiceError } from '../interfaces/serviceError';

export const serviceErrorStringify = (serviceError: ServiceError) =>
  `Service ${serviceError.subject}, Error: ${serviceError.error}, Method: ${serviceError.method}`;
