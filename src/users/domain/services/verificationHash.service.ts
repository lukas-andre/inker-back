import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { BaseService } from '../../../global/domain/services/base.service';
import {
  VerificationHash,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';

@Injectable()
export class VerificationHashService
  extends BaseService
  implements OnModuleInit
{
  private saltLength: number;

  constructor(
    @InjectRepository(VerificationHash, 'user-db')
    private readonly verificationHashRepository: Repository<VerificationHash>,
    private readonly configService: ConfigService,
  ) {
    super(VerificationHashService.name);
  }

  onModuleInit() {
    this.saltLength = this.configService.get('verificationHash.saltLength');
  }

  async create(
    userId: number,
    verificationCode: string,
    verificationType: VerificationType,
    tries: number,
  ): Promise<VerificationHash | ServiceError> {
    const verificationHash = await this.hashVerificationCode(verificationCode);

    try {
      return this.verificationHashRepository.save({
        userId,
        verificationType,
        hash: verificationHash,
        tries,
      });
    } catch (error) {
      return this.serviceError(
        this.create,
        'Problems creating verification hash',
        error,
      );
    }
  }

  async findById(id: number) {
    return this.verificationHashRepository.findOne(id);
  }

  async find(options: FindManyOptions<VerificationHash>) {
    return this.verificationHashRepository.find(options);
  }

  async findOne(
    options?: FindOneOptions<VerificationHash>,
  ): Promise<VerificationHash | undefined> {
    return this.verificationHashRepository.findOne(options);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.verificationHashRepository.delete(id);
  }

  async findAndCount(
    options: FindManyOptions<VerificationHash>,
  ): Promise<[VerificationHash[], number]> {
    return this.verificationHashRepository.findAndCount(options);
  }

  async edit(
    id: number,
    update: DeepPartial<VerificationHash> | VerificationHash,
  ): Promise<VerificationHash> {
    return this.verificationHashRepository.save(
      Object.assign(await this.findById(id), update),
    );
  }

  async hashVerificationCode(code: string): Promise<string> {
    return hash(code, this.saltLength);
  }
}
