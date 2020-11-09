declare const _default: (() => {
    type: string;
    name: string;
    host: string;
    username: string;
    password: string;
    database: string;
    port: number;
    entities: string[];
    synchronize: string;
    logging: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost;
export default _default;
