import { BaseModelType } from '../../../global/domain/models/base.model';

export interface IPermission extends BaseModelType {
  controller?: string;
  action?: string;
  description?: string;
}
