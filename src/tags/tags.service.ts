import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from '../posts/infrastructure/dtos/createPost.dto';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { Tag } from './tag.entity';
import { TagInterface } from './tag.interface';

@Injectable()
export class TagsService {
  private readonly serviceName: string = TagsService.name;

  constructor(
    @InjectRepository(Tag, 'tag-db')
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findById(id: string) {
    return this.tagsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Tag>) {
    return this.tagsRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Tag>) {
    return this.tagsRepository.find({
      select: ['id', 'name', 'created_at', 'updated_at'],
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
