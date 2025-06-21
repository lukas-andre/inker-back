import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { verificationHashConf } from '../../../config/verificationHash';
import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { DBServiceCreateException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { PROBLEMS_CREATING_VERIFICATION_HASH } from '../../domain/errors/codes';
import {
  NotificationType,
  VerificationHash,
  VerificationType,
} from '../entities/verificationHash.entity';

@Injectable()
export class VerificationHashRepository
  extends BaseComponent
  implements OnModuleInit
{
  private conf: ConfigType<typeof verificationHashConf>;

  constructor(
    @InjectRepository(VerificationHash, USER_DB_CONNECTION_NAME)
    private readonly verificationHashRepository: Repository<VerificationHash>,
    private readonly configService: ConfigService,
  ) {
    super(VerificationHashRepository.name);
  }

  onModuleInit() {
    this.conf = this.configService.get('verificationHash');
  }

  public async create(
    userId: string,
    verificationCode: string,
    notificationType: NotificationType,
    verificationType: VerificationType,
    tries: number,
    email?: string,
    phone?: string,
  ): Promise<VerificationHash> {
    const verificationHash = await this.hashVerificationCode(verificationCode);

    try {
      return await this.verificationHashRepository.save({
        userId,
        notificationType,
        verificationType,
        hash: verificationHash,
        tries,
        email,
        phone,
      });
    } catch (error) {
      throw new DBServiceCreateException(
        this,
        PROBLEMS_CREATING_VERIFICATION_HASH,
        error,
      );
    }
  }

  public async findById(id: string) {
    return this.verificationHashRepository.findOne({ where: { id } });
  }

  public async find(options: FindManyOptions<VerificationHash>) {
    return this.verificationHashRepository.find(options);
  }

  public async findOne(
    options?: FindOneOptions<VerificationHash>,
  ): Promise<VerificationHash | undefined> {
    return this.verificationHashRepository.findOne(options);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return this.verificationHashRepository.delete(id);
  }

  public async findAndCount(
    options: FindManyOptions<VerificationHash>,
  ): Promise<[VerificationHash[], number]> {
    return this.verificationHashRepository.findAndCount(options);
  }

  public async edit(
    id: string,
    update: DeepPartial<VerificationHash> | VerificationHash,
  ): Promise<VerificationHash> {
    return this.verificationHashRepository.save(
      Object.assign(await this.findById(id), update),
    );
  }

  public async hashVerificationCode(code: string): Promise<string> {
    return hash(code, this.conf.saltLength);
  }

  public async validateVerificationCode(
    code: string,
    hash: string,
  ): Promise<boolean> {
    return compare(code, hash);
  }

  public generateVerificationCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  public generateForgotPasswordCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
