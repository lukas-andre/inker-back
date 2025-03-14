import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Work } from '../entities/work.entity';
import { CreateWorkDto, UpdateWorkDto } from '../../domain/dtos/work.dto';
import { Tag } from '../../../tags/tag.entity';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { TagsService } from '../../../tags/tags.service';

@Injectable()
export class WorkProvider extends BaseComponent {
  constructor(
    @InjectRepository(Work, 'artist-db')
    private readonly workRepository: Repository<Work>,
    private readonly tagsService: TagsService,
  ) {
    super(WorkProvider.name);
  }

  async findWorksByArtistId(artistId: number): Promise<Work[]> {
    return this.workRepository.find({
      where: { artistId, deletedAt: null },
      relations: ['tags'],
      order: { orderPosition: 'ASC', createdAt: 'DESC' },
    });
  }

  async findFeaturedWorksByArtistId(artistId: number): Promise<Work[]> {
    return this.workRepository.find({
      where: { artistId, isFeatured: true, deletedAt: null },
      relations: ['tags'],
      order: { orderPosition: 'ASC', createdAt: 'DESC' },
    });
  }

  async findWorkById(id: number): Promise<Work> {
    return this.workRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['tags'],
    });
  }

  async createWork(artistId: number, createWorkDto: CreateWorkDto): Promise<Work> {
    const { tagIds, ...workData } = createWorkDto;

    const work = this.workRepository.create({
      ...workData,
      artistId,
    });

    if (tagIds && tagIds.length > 0) {
      work.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
    }

    return this.workRepository.save(work);
  }

  async updateWork(id: number, updateWorkDto: UpdateWorkDto): Promise<Work> {
    const { tagIds, ...workData } = updateWorkDto;
    
    await this.workRepository.update(id, workData);
    
    const work = await this.workRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    
    if (tagIds) {
      work.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
      await this.workRepository.save(work);
    }
    
    return work;
  }

  async deleteWork(id: number): Promise<void> {
    await this.workRepository.softDelete(id);
  }

  async countWorksByArtistId(artistId: number): Promise<number> {
    return this.workRepository.count({
      where: { artistId, deletedAt: null },
    });
  }
}