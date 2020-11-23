import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtistsService } from '../services/artists.service';
import { serviceErrorStringify } from 'src/global/utils/serviceErrorStringify';
import { ServiceError } from 'src/global/interfaces/serviceError';
import { CreateArtistDto } from '../dtos/createArtist.dto';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { Artist } from '../entities/artist.entity';

@Injectable()
export class ArtistsHandler {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly multimediasService: MultimediasService,
    private readonly configService: ConfigService,
  ) {}

  async handleCreate(createArtistdto: CreateArtistDto): Promise<Artist> {
    const created = await this.artistsService.create(createArtistdto);
    if (created instanceof ServiceError) {
      throw new ConflictException(serviceErrorStringify(created));
    }

    return created;
  }

  async handleSetProfileProflePicture(id: string, file: any): Promise<Artist> {
    if (!file) throw new NotFoundException('Not valid file to upload');

    const artist = await this.artistsService.findById(id);
    if (!artist) throw new NotFoundException('Artists not found');

    const source = `artist/${id}`;
    const fileName = `profile-picture_${new Date()}`;
    console.time("uploadFile");

    const { aws, cloudFrontUrl } = await this.multimediasService.upload(
      file,
      source,
      fileName,
    );
    console.timeEnd("uploadFile");

    artist.profileThumbnail = cloudFrontUrl;
    return await this.artistsService.save(artist);
  }

  async handleFindById(id: string) {
    return await this.artistsService.findById(id);
  }
  async handleGetAll(): Promise<Artist[]> {
    return await this.artistsService.find({});
  }
}
