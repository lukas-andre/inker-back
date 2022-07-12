import { BaseModelType } from '../../../global/domain/models/base.model';

export interface PermissionInterface extends BaseModelType {
  controller?: string;
  action?: string;
  description?: string;
}
