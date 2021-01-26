import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from 'src/reactions/infrastructure/entities/reaction.entity';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';

@Injectable()
export class ReactionsService {
  private readonly serviceName: string = ReactionsService.name;

  constructor(
    @InjectRepository(Reaction, 'reaction-db')
    private readonly likesRepository: Repository<Reaction>,
  ) {}

  async findById(id: string) {
    return await this.likesRepository.findOne(id);
  }

  async find(options: FindManyOptions<Reaction>) {
    return await this.likesRepository.find(options);
  }

  async findByKey(
    findConditions: FindConditions<Reaction>,
    select: (keyof Reaction)[],
  ) {
    return await this.likesRepository.find({
      select,
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Reaction>) {
    return await this.likesRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Reaction>,
  ): Promise<Reaction | undefined> {
    return await this.likesRepository.findOne(options);
  }

  async save(artist: DeepPartial<Reaction>): Promise<Reaction> {
    return await this.likesRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.likesRepository.delete(id);
  }
}
