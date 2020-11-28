import { Injectable } from "@nestjs/common";
import { DomainNotFoundException } from "src/global/domain/exceptions/domainNotFound.exception copy";
import { DomainException } from "../../global/domain/exceptions/domain.exception";
import { ArtistsService } from "../domain/services/artists.service";
import { BaseArtistResponse } from "../infrastructure/dtos/baseArtistResponse.dto";
import { UpdateArtistDto } from "../infrastructure/dtos/updateArtist.dto";

@Injectable()
export class UpdateArtistBasicInfoUseCase {
    constructor(private readonly aristsService: ArtistsService) {}

    async execute(id: string, updateArtistDto: UpdateArtistDto): Promise<BaseArtistResponse | DomainException> {
        const result = await this.aristsService.findById(id);
        if (!result) {
            return new DomainNotFoundException('Artist not found');
        }
        Object.assign(result, updateArtistDto);

        return this.aristsService.save(result);
    }
}