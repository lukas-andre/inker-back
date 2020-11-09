"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Client = void 0;
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
const config_1 = require("@nestjs/config");
let S3Client = class S3Client {
    constructor(configService) {
        this.configService = configService;
        if (!this.client) {
            this.client = new AWS.S3({
                accessKeyId: this.configService.get('aws.accessKey'),
                secretAccessKey: this.configService.get('aws.secretKey'),
                region: this.configService.get('aws.region'),
            });
        }
    }
    async get(path) {
        const params = {
            Bucket: this.configService.get('aws.bucketName'),
            Key: path,
        };
        return this.client.getObject(params).promise();
    }
    async put(data, path) {
        const params = {
            Bucket: this.configService.get('aws.artistBucketName'),
            Body: data,
            Key: path,
        };
        return this.client.upload(params).promise();
    }
};
S3Client = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Client);
exports.S3Client = S3Client;
//# sourceMappingURL=s3.client.js.map