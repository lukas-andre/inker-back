"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDomainException = void 0;
const common_1 = require("@nestjs/common");
const domainConflict_exception_1 = require("../../domain/exceptions/domainConflict.exception");
const domainNotFound_exception_1 = require("../../domain/exceptions/domainNotFound.exception");
exports.resolveDomainException = (domainException) => {
    if (domainException instanceof domainConflict_exception_1.DomainConflictException)
        return new common_1.ConflictException(domainException.response);
    if (domainException instanceof domainNotFound_exception_1.DomainNotFoundException)
        return new common_1.NotFoundException(domainException.response);
};
//# sourceMappingURL=resolveDomainException.js.map