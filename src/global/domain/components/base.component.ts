import { Logger } from '@nestjs/common/services';

export class BaseComponent {
  protected readonly logger: Logger;
  readonly name: string;

  constructor(readonly serviceName: string) {
    this.name = serviceName;
    this.logger = new Logger(serviceName);
  }
}
