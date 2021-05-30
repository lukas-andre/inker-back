import { ServiceError } from '../interfaces/serviceError';

export function isServiceError(
  object: ServiceError | unknown,
): object is ServiceError {
  return (
    (object as ServiceError).service !== undefined &&
    (object as ServiceError).method !== undefined &&
    (object as ServiceError).publicErrorMessage !== undefined
  );
}
