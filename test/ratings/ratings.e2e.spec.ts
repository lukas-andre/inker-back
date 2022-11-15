import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { ReviewsModule } from '../../src/reviews/reviews.module';

let app: NestFastifyApplication;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [ReviewsModule],
  }).compile();

  app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

describe('RatingsController (e2e)', () => {
  it('/GET should return 400 if artistId is not a number', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/ratings/abc',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
    });
  });

  it('/GET should enter to the controller if artistId is a number', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/ratings/123',
    });
    expect(response.json()).not.toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
    });
  });
});

afterAll(async () => {
  await app.close();
});
