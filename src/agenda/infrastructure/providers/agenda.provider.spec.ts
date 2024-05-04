import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { always } from '../../../global/domain/utils/always';
import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';
import {
  AgendaInvitation,
  AgendaInvitationStatus,
} from '../entities/agendaInvitation.entity';

import { AgendaProvider } from './agenda.provider';
import { AgendaEventProvider } from './agendaEvent.provider';
import { AgendaInvitationProvider } from './agendaInvitation.provider';

describe('AgendaProvider', () => {
  const agendaToken = getRepositoryToken(Agenda);
  const agendaEventToken = getRepositoryToken(AgendaEvent);
  const agendaInvitationToken = getRepositoryToken(AgendaInvitation);

  let agendaProvider: AgendaProvider;
  let agendaEventProvider: AgendaEventProvider;
  let agendaInvitationProvider: AgendaInvitationProvider;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          name: AGENDA_DB_CONNECTION_NAME,
          entities: [Agenda, AgendaEvent, AgendaInvitation],
          synchronize: true,
          dropSchema: true,
          logging: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(
          [Agenda, AgendaEvent, AgendaInvitation],
          AGENDA_DB_CONNECTION_NAME,
        ),
      ],
      providers: [
        {
          provide: agendaToken,
          useClass: Repository,
        },
        {
          provide: agendaEventToken,
          useClass: Repository,
        },
        {
          provide: agendaInvitationToken,
          useClass: Repository,
        },
        AgendaProvider,
        AgendaEventProvider,
        AgendaInvitationProvider,
      ],
    }).compile();

    agendaProvider = moduleFixture.get<AgendaProvider>(AgendaProvider);
    agendaEventProvider =
      moduleFixture.get<AgendaEventProvider>(AgendaEventProvider);
    agendaInvitationProvider = moduleFixture.get<AgendaInvitationProvider>(
      AgendaInvitationProvider,
    );
  });

  afterAll(async () => {
    await agendaProvider.repo.query('DROP TABLE IF EXISTS agenda CASCADE');
    await agendaInvitationProvider.repo.query(
      'DROP TABLE IF EXISTS agenda_invitation CASCADE;',
    );
    await agendaEventProvider.repo.query(
      'DROP TABLE IF EXISTS agenda_event CASCADE',
    );
    await moduleFixture.close();
  });

  it('agendaProvider should be defined', async () => {
    expect(agendaProvider).toBeDefined();
  });

  it('agendaProvider.repo should be defined as Repository', async () => {
    expect(agendaProvider.repo).toBeDefined();
    expect(agendaProvider.repo).toBeInstanceOf(Repository);
  });

  it('agendaProvider.source should be defined as DataSource', async () => {
    expect(agendaProvider.source).toBeDefined();
    expect(agendaProvider.source).toBeInstanceOf(DataSource);
  });

  it('agendaProvider.manager should be defined as EntityManager', async () => {
    expect(agendaProvider.manager).toBeDefined();
    expect(agendaProvider.manager).toBeInstanceOf(EntityManager);
  });

  it('angeda column should be created', async () => {
    const agenda = await agendaProvider.repo.save({
      id: 1,
      artistId: 1,
      open: true,
      public: true,
      userId: 1,
      workingDays: ['1', '2', '3', '4', '5'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<Agenda>);

    expect(agenda).toBeDefined();
    expect(agenda.id).toBeDefined();
    expect(agenda.artistId).toBe(1);
    expect(agenda.open).toBe(true);
    expect(agenda.public).toBe(true);
    expect(agenda.userId).toBe(1);
    expect(agenda.workingDays).toStrictEqual(['1', '2', '3', '4', '5']);
    expect(agenda.createdAt).toBeDefined();
    expect(agenda.updatedAt).toBeDefined();
  });

  it('agenda_event table should have index on start and end date', async () => {
    const query = `
        SELECT i.indexname, i.indexdef, i.tablename
        FROM pg_indexes AS i
        WHERE i.tablename = 'agenda_event' AND i.indexdef LIKE '%(start, "end")%'
    `;

    const result = await agendaProvider.manager.query(query);

    // Verifica que la consulta retorna al menos un índice que cubra ambas columnas
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].indexname).toContain('IDX');
    expect(result[0].tablename).toContain('agenda_event');
  });

  it('agendaProvider.createEventAndInvitation should create an event and an invitation', async () => {
    const [agendaId, customerId, aristId, userId, eventId] = always(1);

    const mockAgenda = {
      id: agendaId,
      artistId: aristId,
      open: true,
      public: true,
      userId: userId,
      workingDays: ['1', '2', '3', '4', '5'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Partial<Agenda>;

    const mockAgendaInvitation = {
      id: 1,
      inviteeId: customerId,
      status: AgendaInvitationStatus.pending,
      updatedAt: new Date(),
    } satisfies Partial<AgendaInvitation>;

    const mockEvent = {
      id: eventId,
      done: false,
      title: 'test',
      info: 'test',
      color: 'test',
      end: new Date(),
      start: new Date(),
      notification: true,
      customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Partial<AgendaEvent>;

    await agendaProvider.repo.save(mockAgenda);

    const event = await agendaProvider.createEventAndInvitationTransaction({
      agendaId: mockAgenda.id,
      title: 'test',
      info: 'test',
      color: 'test',
      end: new Date().toISOString(),
      start: new Date().toISOString(),
      notification: true,
      customerId,
    });

    expect(event).toBeDefined();
    expect(event).toBe(true);

    const createdEvent = await agendaEventProvider.repo.findOne({
      where: { id: eventId },
    });

    expect(createdEvent).toBeDefined();
    expect(createdEvent.id).toBe(eventId);
    expect(createdEvent.done).toBe(false);
    expect(createdEvent.title).toBe('test');
    expect(createdEvent.info).toBe('test');
    expect(createdEvent.color).toBe('test');
    expect(createdEvent.end).toBeDefined();
    expect(createdEvent.start).toBeDefined();
    expect(createdEvent.notification).toBe(true);
    expect(createdEvent.customerId).toBe(customerId);
    expect(createdEvent.createdAt).toBeDefined();
    expect(createdEvent.updatedAt).toBeDefined();

    const createdInvitation = await agendaInvitationProvider.repo.findOne({
      where: { event: { id: eventId } },
    });

    expect(createdInvitation).toBeDefined();
    expect(createdInvitation.id).toBeDefined();
    expect(createdInvitation.inviteeId).toBe(customerId);
    expect(createdInvitation.status).toBe(AgendaInvitationStatus.pending);
    expect(createdInvitation.updatedAt).toBeDefined();
  });
});
