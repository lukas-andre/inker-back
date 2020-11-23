"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = config_1.registerAs('aws', () => ({
    region: 'us-east-1',
    artistBucketName: process.env.AWS_ARTISTS_BUCKET,
    bucketImageZipSize: 31457280,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_ACCESS_SECRET,
    cloudFrontUrl: process.env.CLOUD_FRONT_URL,
}));
//# sourceMappingURL=aws.js.map