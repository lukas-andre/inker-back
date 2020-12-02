export interface JwtPermission {
    c: string;
    a: string;
}
export interface JwtPayload {
    id: string;
    username: string;
    fullname: string;
    email?: string;
    userType: string;
    userTypeId: string;
    profileThumbnail: string;
    permision: JwtPermission[];
}
export interface FullJwtPayload extends JwtPayload {
    accessToken: string;
    expiresIn: number;
}
