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
exports.MultimediasService = void 0;
const common_1 = require("@nestjs/common");
const s3_client_1 = require("../../global/clients/s3.client");
let MultimediasService = class MultimediasService {
    constructor(s3Client) {
        this.s3Client = s3Client;
    }
    async upload(file, source, fileName) {
        source = source ? source : 'inker';
        fileName = fileName ? fileName : file.originalname;
        const urlKey = `${source}/${fileName}`;
        return await this.s3Client.put(file.buffer, urlKey);
    }
};
MultimediasService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [s3_client_1.S3Client])
], MultimediasService);
exports.MultimediasService = MultimediasService;
//# sourceMappingURL=multimedias.service.js.map