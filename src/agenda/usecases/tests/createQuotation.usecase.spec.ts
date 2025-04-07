import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { QueryRunner, Repository } from 'typeorm';

import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import { S3Client } from '../../../global/infrastructure/clients/s3.client';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { queues } from '../../../queues/queues';
import {
  Quotation,
  QuotationStatus,
} from '../../infrastructure/entities/quotation.entity';
import { QuotationHistory } from '../../infrastructure/entities/quotationHistory.entity';
import { QuotationProvider } from '../../infrastructure/providers/quotation.provider';
import { CreateQuotationUseCase } from '../createQuotation.usecase';

describe('CreateQuotationUseCase', () => {
  let createQuotationUseCase: CreateQuotationUseCase;
  let notificationQueue: DeepMocked<Queue>;
  let quotationProvider: QuotationProvider;
  let moduleFixture: TestingModule;
  let artistProvider: ArtistProvider;
  let customerProvider: CustomerProvider;
  let multimediasService: MultimediasService;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          name: AGENDA_DB_CONNECTION_NAME,
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          entities: [Quotation, QuotationHistory],
          synchronize: true,
          dropSchema: true,
          logging: true,
        }),
        TypeOrmModule.forFeature(
          [Quotation, QuotationHistory],
          AGENDA_DB_CONNECTION_NAME,
        ),
      ],
      providers: [
        CreateQuotationUseCase,
        {
          provide: ArtistProvider,
          useValue: createMock<ArtistProvider>(),
        },
        {
          provide: CustomerProvider,
          useValue: createMock<CustomerProvider>(),
        },
        {
          provide: MultimediasService,
          useValue: createMock<MultimediasService>(),
        },
        {
          provide: S3Client,
          useValue: createMock<S3Client>(),
        },
        {
          provide: getRepositoryToken(Quotation),
          useClass: Repository,
        },
        {
          provide: getQueueToken(queues.notification.name),
          useValue: createMock<Queue>(),
        },
        QuotationProvider,
      ],
    }).compile();

    createQuotationUseCase = moduleFixture.get<CreateQuotationUseCase>(
      CreateQuotationUseCase,
    );
    notificationQueue = moduleFixture.get(
      getQueueToken(queues.notification.name),
    );
    quotationProvider = moduleFixture.get<QuotationProvider>(QuotationProvider);
    artistProvider = moduleFixture.get<ArtistProvider>(ArtistProvider);
    customerProvider = moduleFixture.get<CustomerProvider>(CustomerProvider);
    multimediasService =
      moduleFixture.get<MultimediasService>(MultimediasService);
  });

  afterAll(async () => {
    const connection = quotationProvider.manager.connection;
    const queryRunner = connection.createQueryRunner() as QueryRunner;
    await queryRunner.clearDatabase();
    await queryRunner.release();
    await connection.close();
    moduleFixture.close();
  });

  it('should be defined', () => {
    expect(createQuotationUseCase).toBeDefined();
  });

  it('should create a quotation and add a job to the notification queue', async () => {
    jest.spyOn(artistProvider, 'exists').mockResolvedValue(true);
    jest.spyOn(customerProvider, 'exists').mockResolvedValue(true);
    jest.spyOn(multimediasService, 'uploadReferenceImages').mockResolvedValue({
      count: 1,
      metadata: [
        {
          encoding: '7bit',
          fieldname: 'files[]',
          originalname: 'image1.png',
          position: 0,
          size: 441730,
          type: 'image/png',
          url: 'http://example.com/image1.png',
        },
      ],
    });

    const createQuotationDto = {
      customerId: 1,
      artistId: 1,
      description: 'Tattoo design',
      title: 'Tattoo title',
    };

    const referenceImages = [
      {
        fieldname: 'files[]',
        originalname: 'image1.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from([]),
        size: 441730,
      },
    ];

    const result = await createQuotationUseCase.execute(
      createQuotationDto,
      referenceImages,
    );

    expect(result).toEqual({
      message: 'Quotation created successfully',
      created: true,
    });

    const quotation = await quotationProvider.findOne({
      where: {
        customerId: createQuotationDto.customerId,
        artistId: createQuotationDto.artistId,
      },
    });

    expect(quotation).toBeDefined();
    expect(quotation.status).toBe('pending' as QuotationStatus);
    expect(quotation.description).toBe(createQuotationDto.description);
    expect(quotation.referenceImages).toEqual({
      count: 1,
      metadata: [
        {
          encoding: '7bit',
          fieldname: 'files[]',
          originalname: 'image1.png',
          position: 0,
          size: 441730,
          type: 'image/png',
          url: 'http://example.com/image1.png',
        },
      ],
    });

    const add = jest.spyOn(notificationQueue, 'add');
    expect(add).toHaveBeenCalled();
    expect(add).toHaveBeenCalledWith({
      jobId: 'QUOTATION_CREATED',
      metadata: {
        quotationId: quotation.id,
        artistId: createQuotationDto.artistId,
        customerId: createQuotationDto.customerId,
      },
      notificationTypeId: 'EMAIL',
    });
  });

  it('should throw DomainNotFound if artist does not exist', async () => {
    jest.spyOn(artistProvider, 'exists').mockResolvedValue(false);

    const createQuotationDto = {
      customerId: 1,
      artistId: 999,
      description: 'Tattoo design',
      title: 'Tattoo title',
    };

    const referenceImages = [];

    await expect(
      createQuotationUseCase.execute(createQuotationDto, referenceImages),
    ).rejects.toThrow(DomainNotFound);
  });

  it('should throw DomainNotFound if customer does not exist', async () => {
    jest.spyOn(artistProvider, 'exists').mockResolvedValue(true);
    jest.spyOn(customerProvider, 'exists').mockResolvedValue(false);

    const createQuotationDto = {
      customerId: 999,
      artistId: 1,
      description: 'Tattoo design',
      title: 'Tattoo title',
    };

    const referenceImages = [];

    await expect(
      createQuotationUseCase.execute(createQuotationDto, referenceImages),
    ).rejects.toThrow(DomainNotFound);
  });
});
