import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';

@Injectable()
export class UpdateArtistProfilePictureUseCase {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly multimediasService: MultimediasService,
  ) {}

  async execute(id: number, file: any): Promise<Artist | DomainException> {
    if (!file) return new DomainNotFoundException('Not valid file to upload');
    console.log('id: ', id);
    console.log('file2: ', file);
    let artist: Artist;
    try {
      artist = await this.artistsService.findById(id);
    } catch (error) {
      return new DomainInternalServerErrorException(`Error: ${error}`);
    }
    console.log('artist: ', artist);

    if (!artist) return new DomainNotFoundException('Artists not found');

    const source = `artist/${id}`;
    const fileName = `profile_picture_${id}`;
    console.time('uploadFile');

    const { aws, cloudFrontUrl } = await this.multimediasService.upload(
      file,
      source,
      fileName,
    );
    console.timeEnd('uploadFile');

    artist.profileThumbnail = cloudFrontUrl;
    return await this.artistsService.save(artist);
  }
}
