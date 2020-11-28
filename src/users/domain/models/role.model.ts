import { BaseModelType } from '../../../global/domain/models/base.model';
import { IPermission } from './permission.model';

export interface IRole extends BaseModelType {
  name?: string;
  description?: string;
  permissions?: IPermission[];
}
