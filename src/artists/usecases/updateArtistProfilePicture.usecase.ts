import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { DomainInternalServerErrorException } from 'src/global/domain/exceptions/domainInternalServerError.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from 'src/global/domain/exceptions/domainNotFound.exception copy';

@Injectable()
export class UpdateArtistProfilePictureUseCase {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly multimediasService: MultimediasService,
  ) {}

  async execute(id: string, file: any): Promise<Artist | DomainException> {
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
    const fileName = `profile-picture_${new Date()}`;
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
