import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { BaseArtistResponse } from '../infrastructure/dtos/baseArtistResponse.dto';
import { AddFollowToArtistParams } from './interfaces/addFollowtoArtist.param';
export declare class AddFollowToArtistUseCase {
    constructor();
    execute(id: string, followParams: AddFollowToArtistParams): Promise<BaseArtistResponse | DomainException>;
}
