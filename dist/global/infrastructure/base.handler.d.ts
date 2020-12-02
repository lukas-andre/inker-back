import { JwtService } from '@nestjs/jwt';
import { DomainException } from '../domain/exceptions/domain.exception';
import { JwtPayload } from '../domain/interfaces/jwtPayload.interface';
export declare class BaseHandler {
    private readonly JWTService;
    constructor(JWTService: JwtService);
    getJwtPayloadFromRequest(request: any): JwtPayload;
    resolve<T>(result: DomainException | T): T;
}
