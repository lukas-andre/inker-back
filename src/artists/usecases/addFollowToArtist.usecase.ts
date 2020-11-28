import { Injectable } from "@nestjs/common";
import { DomainException } from "../../global/domain/exceptions/domain.exception";
import { ArtistsService } from "../domain/services/artists.service";
import { BaseArtistResponse } from "../infrastructure/dtos/baseArtistResponse.dto";
// import { FollowDto } from "../infrastructure/dtos/follow.dto";
import { UpdateArtistDto } from "../infrastructure/dtos/updateArtist.dto";

@Injectable()
export class AddFollowToArtistUseCase {
    constructor(private readonly aristsService: ArtistsService, private readonly FollowsService) {}

    async execute(id: string, followParams: any): Promise<BaseArtistResponse | DomainException> {
        return null;
        // const result = await this.aristsService.findById(id);
        // if (!result) {
        //     return new DomainNotFoundException('Artist not found');
        // }
        // Object.assign(result, updateArtistDto);

        // return this.aristsService.save(result);
    }
}