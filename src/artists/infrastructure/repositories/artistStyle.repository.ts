import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseComponent } from '../../../global/domain/components/base.component';
import {
  CreateArtistStyleDto,
  UpdateArtistStyleDto,
} from '../../domain/dtos/artistStyle.dto';
import { ArtistStyle } from '../entities/artistStyle.entity';

@Injectable()
export class ArtistStyleRepository extends BaseComponent {
  constructor(
    @InjectRepository(ArtistStyle, 'artist-db')
    private readonly artistStyleRepository: Repository<ArtistStyle>,
  ) {
    super(ArtistStyleRepository.name);
  }

  async findStylesByArtistId(artistId: string): Promise<ArtistStyle[]> {
    return this.artistStyleRepository.find({
      where: { artistId },
      order: { proficiencyLevel: 'DESC', styleName: 'ASC' },
    });
  }

  async findArtistStyle(
    artistId: string,
    styleName: string,
  ): Promise<ArtistStyle> {
    return this.artistStyleRepository.findOne({
      where: { artistId, styleName },
    });
  }

  async createArtistStyle(
    artistId: string,
    createArtistStyleDto: CreateArtistStyleDto,
  ): Promise<ArtistStyle> {
    const artistStyle = this.artistStyleRepository.create({
      artistId,
      styleName: createArtistStyleDto.styleName,
      proficiencyLevel: createArtistStyleDto.proficiencyLevel || 3,
    });

    return this.artistStyleRepository.save(artistStyle);
  }

  async updateArtistStyle(
    artistId: string,
    styleName: string,
    updateArtistStyleDto: UpdateArtistStyleDto,
  ): Promise<ArtistStyle> {
    await this.artistStyleRepository.update(
      { artistId, styleName },
      { proficiencyLevel: updateArtistStyleDto.proficiencyLevel },
    );

    return this.artistStyleRepository.findOne({
      where: { artistId, styleName },
    });
  }

  async deleteArtistStyle(artistId: string, styleName: string): Promise<void> {
    await this.artistStyleRepository.delete({ artistId, styleName });
  }
}
