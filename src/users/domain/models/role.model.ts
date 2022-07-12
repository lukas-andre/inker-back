import { BaseModelType } from '../../../global/domain/models/base.model';
import { PermissionInterface } from './permission.model';

export interface RoleInterface extends BaseModelType {
  name?: string;
  description?: string;
  permissions?: PermissionInterface[];
}
