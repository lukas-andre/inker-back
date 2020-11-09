"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileApiBodyOptions = void 0;
exports.fileApiBodyOptions = {
    type: 'multipart/form-data',
    required: true,
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
            },
        },
    },
};
//# sourceMappingURL=fileApiBodyOptions.js.map