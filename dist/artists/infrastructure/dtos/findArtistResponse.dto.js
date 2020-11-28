"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindArtistResponse = void 0;
const openapi = require("@nestjs/swagger");
const follower_interface_1 = require("../../domain/interfaces/follower.interface");
const customerFollows_interface_1 = require("../../../customers/domain/interfaces/customerFollows.interface");
class FindArtistResponse {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, contactEmail: { required: true, type: () => String }, contactPhoneNumber: { required: false, type: () => String }, shortDescription: { required: false, type: () => String }, profileThumbnail: { required: false, type: () => String }, follows: { required: false, type: () => [Object] }, followers: { required: false, type: () => [Object] }, rating: { required: true, type: () => Number }, created_at: { required: false, type: () => Date }, updated_at: { required: false, type: () => Date } };
    }
}
exports.FindArtistResponse = FindArtistResponse;
//# sourceMappingURL=findArtistResponse.dto.js.map