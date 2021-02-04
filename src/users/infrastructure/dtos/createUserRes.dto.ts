import { IRole } from '../../domain/models/role.model';

export class CreateUserResDto {
  id: number;
  username?: string;
  email?: string;
  active?: boolean;
  userType?: string;
  role?: IRole;
}
