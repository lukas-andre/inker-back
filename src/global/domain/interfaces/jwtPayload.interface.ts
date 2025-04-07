import { UserType } from '../../../users/domain/enums/userType.enum';

export interface JwtPermission {
  c: string;
  a: string;
}

export interface JwtPayload {
  id: number;
  username: string;
  fullname: string;
  email?: string;
  userType: UserType;
  userTypeId: number;
  profileThumbnail: string;
  permission: JwtPermission[];
}

export interface FullJwtPayload extends JwtPayload {
  accessToken: string;
  expiresIn: string;
}
