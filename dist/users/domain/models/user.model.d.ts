import { BaseModelType } from '../../../global/domain/models/base.model';
import { IRole } from './role.model';
export interface IUser extends BaseModelType {
    username?: string;
    email?: string;
    active?: boolean;
    userType?: string;
    role?: IRole;
}
