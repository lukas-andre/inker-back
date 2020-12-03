"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseArtistResponse = void 0;
const openapi = require("@nestjs/swagger");
class BaseArtistResponse {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: false, type: () => Number }, userId: { required: false, type: () => Number }, firstName: { required: false, type: () => String }, lastName: { required: false, type: () => String }, contactEmail: { required: false, type: () => String }, contactPhoneNumber: { required: false, type: () => String }, shortDescription: { required: false, type: () => String }, profileThumbnail: { required: false, type: () => String }, tags: { required: false, type: () => Object }, genders: { required: false, type: () => Object }, followers: { required: false, type: () => Number }, rating: { required: false, type: () => Number }, created_at: { required: false, type: () => Date }, updated_at: { required: false, type: () => Date } };
    }
}
exports.BaseArtistResponse = BaseArtistResponse;
//# sourceMappingURL=baseArtistResponse.dto.js.map