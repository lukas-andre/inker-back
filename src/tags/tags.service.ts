import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { CreatePostDto } from '../posts/infrastructure/dtos/createPost.dto';

import { Tag } from './tag.entity';
import { TagInterface } from './tag.interface';

@Injectable()
export class TagsService {
  private readonly serviceName: string = TagsService.name;

  constructor(
    @InjectRepository(Tag, 'tag-db')
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findById(id: number) {
    return this.tagsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Tag>) {
    return this.tagsRepository.find(options);
  }

  async findByKey(findConditions: FindOptionsWhere<Tag>) {
    return this.tagsRepository.find({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Tag>) {
    return this.tagsRepository.findAndCount(options);
  }

  async findOne(options?: FindOneOptions<Tag>): Promise<Tag | undefined> {
    return this.tagsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Tag>): Promise<Tag> {
    return this.tagsRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.tagsRepository.delete(id);
  }

  async handlePostTags(
    createPostDto: CreatePostDto,
    tagsEntities: TagInterface[],
  ): Promise<void> {
    for (const tag of createPostDto.tags) {
      const existTag = await this.findOne({
        where: {
          name: tag,
        },
      });

      tagsEntities.push(
        existTag
          ? { name: tag }
          : { name: (await this.save({ name: tag })).name },
      );
    }
  }
}
