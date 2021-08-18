import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CreatePostDto } from '../posts/infrastructure/dtos/createPost.dto';
import { Genrer } from './genre.entity';
import { GenreInterface } from './genre.interface';

@Injectable()
export class GenresService {
  private readonly serviceName: string = GenresService.name;

  constructor(
    @InjectRepository(Genrer, 'genre-db')
    private readonly genresRepository: Repository<Genrer>,
  ) {}

  async findById(id: string) {
    return this.genresRepository.findOne(id);
  }

  async find(options: FindManyOptions<Genrer>) {
    return this.genresRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Genrer>) {
    return this.genresRepository.find({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Genrer>) {
    return this.genresRepository.findAndCount(options);
  }

  async findOne(options?: FindOneOptions<Genrer>): Promise<Genrer | undefined> {
    return this.genresRepository.findOne(options);
  }

  async save(artist: DeepPartial<Genrer>): Promise<Genrer> {
    return this.genresRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.genresRepository.delete(id);
  }

  async handlePostGenres(
    createPostDto: CreatePostDto,
    genresEntities: GenreInterface[],
  ): Promise<void> {
    for (const genrer of createPostDto.genders) {
      const existGender = await this.findOne({
        where: {
          name: genrer,
        },
      });

      genresEntities.push(
        existGender
          ? { name: genrer }
          : { name: (await this.save({ name: genrer })).name },
      );
    }
  }
}
