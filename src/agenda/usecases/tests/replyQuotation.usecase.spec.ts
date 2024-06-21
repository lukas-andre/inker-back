import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { QueryRunner, Repository } from 'typeorm';

import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import {
  DomainBadRule,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { queues } from '../../../queues/queues';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import { ReplyQuotationReqDto } from '../../infrastructure/dtos/replyQuotationReq.dto';
import {
  Quotation,
  QuotationStatus,
} from '../../infrastructure/entities/quotation.entity';
import { QuotationHistory } from '../../infrastructure/entities/quotationHistory.entity';
import { QuotationProvider } from '../../infrastructure/providers/quotation.provider';
import { ReplyQuotationUseCase } from '../replyQuotation.usecase';

describe('ReplyQuotationUseCase', () => {
  let replyQuotationUseCase: ReplyQuotationUseCase;
  let notificationQueue: DeepMocked<Queue>;
  let quotationProvider: QuotationProvider;
  let moduleFixture: TestingModule;
  let artistProvider: ArtistProvider;
  let quotationStateMachine: QuotationStateMachine;
  let multimediaService: MultimediasService;

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
        ReplyQuotationUseCase,
        QuotationProvider,
        {
          provide: ArtistProvider,
          useValue: createMock<ArtistProvider>(),
        },
        {
          provide: QuotationStateMachine,
          useValue: createMock<QuotationStateMachine>(),
        },
        {
          provide: MultimediasService,
          useValue: createMock<MultimediasService>(),
        },
        {
          provide: getRepositoryToken(Quotation),
          useClass: Repository,
        },
        {
          provide: getQueueToken(queues.notification.name),
          useValue: createMock<Queue>(),
        },
      ],
    }).compile();

    replyQuotationUseCase = moduleFixture.get<ReplyQuotationUseCase>(
      ReplyQuotationUseCase,
    );
    notificationQueue = moduleFixture.get(
      getQueueToken(queues.notification.name),
    );
    quotationProvider = moduleFixture.get<QuotationProvider>(QuotationProvider);
    artistProvider = moduleFixture.get<ArtistProvider>(ArtistProvider);
    quotationStateMachine = moduleFixture.get<QuotationStateMachine>(
      QuotationStateMachine,
    );
    multimediaService =
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
    expect(replyQuotationUseCase).toBeDefined();
  });

  it('should reply to a quotation and add a job to the notification queue', async () => {
    jest.spyOn(artistProvider, 'exists').mockResolvedValue(true);
    jest.spyOn(multimediaService, 'uploadProposedImages').mockResolvedValue({
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

    const replyQuotationDto: ReplyQuotationReqDto = {
      artistId: 1,
      quotationId: 1,
      estimatedCost: 200,
      appointmentDate: new Date(),
      appointmentDuration: 1,
    };

    const proposedImages: FileInterface[] = [
      {
        fieldname: 'files[]',
        originalname: 'image1.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from([]),
        size: 441730,
      },
    ];

    await quotationProvider.repo.query(
      'INSERT INTO quotation (id, customer_id, artist_id, description, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
      [1, 1, 1, 'descriptionTest', 'pending'],
    );

    const result = await replyQuotationUseCase.execute(
      replyQuotationDto,
      proposedImages,
    );

    expect(result).toEqual({
      message: 'Quotation replied successfully',
      updated: true,
    });

    const quotation = await quotationProvider.repo.findOne({
      relations: ['history'],
      where: { id: replyQuotationDto.quotationId },
    });

    const { history } = quotation;

    expect(quotation).toBeDefined();
    expect(quotation.status).toBe('quoted' as QuotationStatus);
    expect(quotation.estimatedCost).toBe(replyQuotationDto.estimatedCost);
    expect(quotation.appointmentDate).toEqual(
      replyQuotationDto.appointmentDate,
    );
    expect(quotation.appointmentDuration).toBe(
      replyQuotationDto.appointmentDuration,
    );

    expect(history).toHaveLength(1);
    expect(history[0].status).toBe('pending' as QuotationStatus);
    expect(history[0].changedBy).toBe(1);
    expect(history[0].changedByUserType).toBe('customer');

    const add = jest.spyOn(notificationQueue, 'add');
    expect(add).toHaveBeenCalled();
    expect(add).toHaveBeenCalledWith({
      jobId: 'QUOTATION_REPLIED',
      metadata: {
        quotationId: quotation.id,
        artistId: replyQuotationDto.artistId,
        estimatedCost: replyQuotationDto.estimatedCost,
      },
      notificationTypeId: 'EMAIL',
    });
  });

  it('should throw DomainNotFound if artist does not exist', async () => {
    jest.spyOn(artistProvider, 'exists').mockResolvedValue(false);

    const replyQuotationDto: ReplyQuotationReqDto = {
      artistId: 999,
      quotationId: 1,
      estimatedCost: 200,
      appointmentDate: new Date(),
      appointmentDuration: 1,
    };

    const proposedImages: FileInterface[] = [];

    await expect(
      replyQuotationUseCase.execute(replyQuotationDto, proposedImages),
    ).rejects.toThrow(DomainNotFound);
  });

  it('should throw DomainNotFound if quotation does not exist', async () => {
    jest.spyOn(artistProvider, 'exists').mockResolvedValue(true);
    jest.spyOn(quotationProvider, 'findById').mockResolvedValue(null);

    const replyQuotationDto: ReplyQuotationReqDto = {
      artistId: 1,
      quotationId: 999,
      estimatedCost: 200,
      appointmentDate: new Date(),
      appointmentDuration: 1,
    };

    const proposedImages: FileInterface[] = [];

    await expect(
      replyQuotationUseCase.execute(replyQuotationDto, proposedImages),
    ).rejects.toThrow(DomainNotFound);
  });
});
