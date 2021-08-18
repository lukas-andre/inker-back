import { GenreInterface } from '../../../../genres/genre.interface';
import { MultimediasMetadataInterface } from '../../../../multimedias/interfaces/multimediasMetadata.interface';
import { TagInterface } from '../../../../tags/tag.interface';

export class PostInterface {
  id: number;
  content: string;
  location: string;
  userId: number;
  userTypeId: number;
  userType: string;
  username: string;
  profileThumbnail: string;
  multimedia: MultimediasMetadataInterface;
  tags: TagInterface[];
  genres: GenreInterface[];
  created_at: Date;
  updated_at: Date;
}
