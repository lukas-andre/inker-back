export class ServiceError {
  service: string;
  method: string;
  publicErrorMessage: string;
  catchedErrorMessage?: any;
}
