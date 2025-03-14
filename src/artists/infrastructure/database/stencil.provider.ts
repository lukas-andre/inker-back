import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Stencil } from '../entities/stencil.entity';
import { CreateStencilDto, UpdateStencilDto } from '../../domain/dtos/stencil.dto';
import { Tag } from '../../../tags/tag.entity';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { TagsService } from '../../../tags/tags.service';

@Injectable()
export class StencilProvider extends BaseComponent {
  constructor(
    @InjectRepository(Stencil, 'artist-db')
    private readonly stencilRepository: Repository<Stencil>,
    private readonly tagsService: TagsService,
  ) {
    super(StencilProvider.name);
  }

  async findStencilsByArtistId(artistId: number): Promise<Stencil[]> {
    return this.stencilRepository.find({
      where: { artistId, deletedAt: null },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableStencilsByArtistId(artistId: number): Promise<Stencil[]> {
    return this.stencilRepository.find({
      where: { artistId, isAvailable: true, deletedAt: null },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findStencilById(id: number): Promise<Stencil> {
    return this.stencilRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['tags'],
    });
  }

  async createStencil(artistId: number, createStencilDto: CreateStencilDto): Promise<Stencil> {
    const { tagIds, ...stencilData } = createStencilDto;

    const stencil = this.stencilRepository.create({
      ...stencilData,
      artistId,
    });

    if (tagIds && tagIds.length > 0) {
      stencil.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
    }

    return this.stencilRepository.save(stencil);
  }

  async updateStencil(id: number, updateStencilDto: UpdateStencilDto): Promise<Stencil> {
    const { tagIds, ...stencilData } = updateStencilDto;
    
    await this.stencilRepository.update(id, stencilData);
    
    const stencil = await this.stencilRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    
    if (tagIds) {
      stencil.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
      await this.stencilRepository.save(stencil);
    }
    
    return stencil;
  }

  async deleteStencil(id: number): Promise<void> {
    await this.stencilRepository.softDelete(id);
  }

  async countStencilsByArtistId(artistId: number): Promise<number> {
    return this.stencilRepository.count({
      where: { artistId, deletedAt: null },
    });
  }

  async findStencilsByArtistIdWithPagination(
    artistId: number,
    page: number = 1,
    limit: number = 10,
    isAvailable?: boolean
  ): Promise<[Stencil[], number]> {
    const queryBuilder = this.stencilRepository
      .createQueryBuilder('stencil')
      .leftJoinAndSelect('stencil.tags', 'tags')
      .where('stencil.artistId = :artistId', { artistId })
      .andWhere('stencil.deletedAt IS NULL');
    
    if (isAvailable !== undefined) {
      queryBuilder.andWhere('stencil.isAvailable = :isAvailable', { isAvailable });
    }
    
    queryBuilder.orderBy('stencil.createdAt', 'DESC');
    
    const offset = (page - 1) * limit;
    
    const [stencils, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    
    return [stencils, total];
  }
}