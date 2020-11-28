"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseArtistResponse = void 0;
const openapi = require("@nestjs/swagger");
class BaseArtistResponse {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, contactEmail: { required: true, type: () => String }, contactPhoneNumber: { required: false, type: () => String }, shortDescription: { required: false, type: () => String }, profileThumbnail: { required: false, type: () => String }, tags: { required: false, type: () => [require("../entities/tag.entity").Tag] }, genders: { required: false, type: () => [require("../entities/genders.entity").Gender] }, followers: { required: false, type: () => [require("../entities/follower.entity").Follower] }, rating: { required: true, type: () => Number }, created_at: { required: true, type: () => Date }, updated_at: { required: true, type: () => Date } };
    }
}
exports.BaseArtistResponse = BaseArtistResponse;
//# sourceMappingURL=baseArtistResponse.dto.js.map