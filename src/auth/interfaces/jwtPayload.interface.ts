export interface JwtPermission {
  c: string;
  a: string;
}

export interface JwtPayload {
  id: string;
  username?: string;
  email?: string;
  userType: string;
  userTypeId: string;
  permision: JwtPermission[];
}
