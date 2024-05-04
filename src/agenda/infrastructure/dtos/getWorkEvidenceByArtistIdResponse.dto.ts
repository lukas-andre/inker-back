import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from 'nestjs-typeorm-paginate';

import { AgendaEvent } from '../entities/agendaEvent.entity';

export class GetWorkEvidenceByArtistIdResponseDto {
  @ApiProperty({
    description: 'Agenda events',
    example: {
      id: 8,
      createdAt: '2023-03-21T05:38:35.713Z',
      updatedAt: '2023-03-21T05:38:53.320Z',
      customerId: 7,
      title: 'Tatto for Test 4',
      start: '2023-03-26T19:00:00.000Z',
      end: '2023-03-26T19:30:00.000Z',
      color: 'Red',
      info: 'This tatto bla bla bla bla ba',
      notification: true,
      done: true,
      workEvidence: {
        count: 2,
        metadata: [
          {
            url: 'https://d1riey1i0e5tx2.cloudfront.net/agenda/1/event/8/work-evidence/file_0',
            size: 33783,
            type: 'image/jpeg',
            encoding: '7bit',
            position: 0,
            fieldname: 'files[]',
            originalname: '4.jpg',
          },
          {
            url: 'https://d1riey1i0e5tx2.cloudfront.net/agenda/1/event/8/work-evidence/file_0',
            size: 33783,
            type: 'image/jpeg',
            encoding: '7bit',
            position: 1,
            fieldname: 'files[]',
            originalname: '4.jpg',
          },
        ],
      },
      deletedAt: null,
      review: {
        id: 8,
        createdAt: '2023-03-21T05:42:55.824Z',
        updatedAt: '2023-03-21T05:42:55.824Z',
        artistId: 1,
        eventId: 8,
        value: 5,
        header: 'This artist is awesome',
        content: 'This artist is excellent  4',
        reviewReactions: {
          likes: 1,
          dislikes: 0,
        },
        createdBy: 7,
        displayName: 'Test 4',
        isRated: true,
        customerReviewDetail: {
          reviewReactionId: 7,
          liked: true,
          disliked: false,
        },
      },
    },
  })
  items: AgendaEvent[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      totalItems: 7,
      itemCount: 7,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  })
  meta: IPaginationMeta;
}
