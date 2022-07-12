import { BaseComponent } from '../components/base.component';
import { DomainException } from '../exceptions/domain.exception';

export interface UseCase {
  execute(...args: any[]): Promise<any | DomainException>;
}

export class BaseUseCase extends BaseComponent {
  constructor(readonly serviceName: string) {
    super(serviceName);
  }
}
