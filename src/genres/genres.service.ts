import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from 'src/posts/infrastructure/dtos/createPost.dto';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { Genrer } from './genre.entity';
import { GenrerInterface } from './genre.interface';

@Injectable()
export class GenresService {
  private readonly serviceName: string = GenresService.name;

  constructor(
    @InjectRepository(Genrer, 'genre-db')
    private readonly genresRepository: Repository<Genrer>,
  ) {}

  async findById(id: string) {
    return await this.genresRepository.findOne(id);
  }

  async find(options: FindManyOptions<Genrer>) {
    return await this.genresRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Genrer>) {
    return await this.genresRepository.find({
      select: ['id', 'name', 'created_at', 'updated_at'],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Genrer>) {
    return await this.genresRepository.findAndCount(options);
  }

  async findOne(options?: FindOneOptions<Genrer>): Promise<Genrer | undefined> {
    return await this.genresRepository.findOne(options);
  }

  async save(artist: DeepPartial<Genrer>): Promise<Genrer> {
    return await this.genresRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.genresRepository.delete(id);
  }

  async handlePostGenres(
    createPostDto: CreatePostDto,
    genresEntities: GenrerInterface[],
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
