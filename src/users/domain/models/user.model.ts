import { BaseModelType } from '../../../global/domain/models/base.model';
import { RoleInterface } from './role.model';

export interface UserInterface extends BaseModelType {
  username: string;
  email: string;
  userType: string;
  role?: RoleInterface;
  active: boolean;
}
