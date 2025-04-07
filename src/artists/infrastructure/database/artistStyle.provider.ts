import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtistStyle } from '../entities/artistStyle.entity';
import { CreateArtistStyleDto, UpdateArtistStyleDto } from '../../domain/dtos/artistStyle.dto';
import { BaseComponent } from '../../../global/domain/components/base.component';

@Injectable()
export class ArtistStyleProvider extends BaseComponent {
  constructor(
    @InjectRepository(ArtistStyle, 'artist-db')
    private readonly artistStyleRepository: Repository<ArtistStyle>,
  ) {
    super(ArtistStyleProvider.name);
  }

  async findStylesByArtistId(artistId: number): Promise<ArtistStyle[]> {
    return this.artistStyleRepository.find({
      where: { artistId },
      order: { proficiencyLevel: 'DESC', styleName: 'ASC' },
    });
  }

  async findArtistStyle(artistId: number, styleName: string): Promise<ArtistStyle> {
    return this.artistStyleRepository.findOne({
      where: { artistId, styleName },
    });
  }

  async createArtistStyle(artistId: number, createArtistStyleDto: CreateArtistStyleDto): Promise<ArtistStyle> {
    const artistStyle = this.artistStyleRepository.create({
      artistId,
      styleName: createArtistStyleDto.styleName,
      proficiencyLevel: createArtistStyleDto.proficiencyLevel || 3,
    });

    return this.artistStyleRepository.save(artistStyle);
  }

  async updateArtistStyle(
    artistId: number,
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

  async deleteArtistStyle(artistId: number, styleName: string): Promise<void> {
    await this.artistStyleRepository.delete({ artistId, styleName });
  }
}