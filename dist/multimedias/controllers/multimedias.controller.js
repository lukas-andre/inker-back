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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultimediasController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multimedias_service_1 = require("../services/multimedias.service");
let MultimediasController = class MultimediasController {
    constructor(multimediasService) {
        this.multimediasService = multimediasService;
    }
    async upload(file) {
        console.log('file: ', file);
        return await this.multimediasService.upload(file);
    }
};
__decorate([
    common_1.Post('upload'),
    common_1.UseInterceptors(platform_express_1.FileInterceptor('file')),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MultimediasController.prototype, "upload", null);
MultimediasController = __decorate([
    swagger_1.ApiTags('multimedias'),
    common_1.Controller('multimedias'),
    __metadata("design:paramtypes", [multimedias_service_1.MultimediasService])
], MultimediasController);
exports.MultimediasController = MultimediasController;
//# sourceMappingURL=multimedias.controller.js.map