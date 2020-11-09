declare const _default: (() => {
    jwtIssuer: string;
    jwtSecretKey: string;
    jwtExpiration: number;
    saltLength: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost;
export default _default;
