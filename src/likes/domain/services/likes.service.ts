import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'src/likes/infrastructure/entities/like.entity';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';

@Injectable()
export class LikesService {
  private readonly serviceName: string = LikesService.name;

  constructor(
    @InjectRepository(Like, 'like-db')
    private readonly likesRepository: Repository<Like>,
  ) {}

  async findById(id: string) {
    return await this.likesRepository.findOne(id);
  }

  async find(options: FindManyOptions<Like>) {
    return await this.likesRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Like>) {
    return await this.likesRepository.find({
      select: [
        'id',
        'active',
        'activityId',
        'type',
        'userId',
        'created_at',
        'updated_at',
      ],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Like>) {
    return await this.likesRepository.findAndCount(options);
  }

  async findOne(options?: FindOneOptions<Like>): Promise<Like | undefined> {
    return await this.likesRepository.findOne(options);
  }

  async save(artist: DeepPartial<Like>): Promise<Like> {
    return await this.likesRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.likesRepository.delete(id);
  }
}
