export interface JwtPermission {
    c: string;
    a: string;
}
export interface JwtPayload {
    id: number;
    username: string;
    fullname: string;
    email?: string;
    userType: string;
    userTypeId: number;
    profileThumbnail: string;
    permision: JwtPermission[];
}
export interface FullJwtPayload extends JwtPayload {
    accessToken: string;
    expiresIn: number;
}
