import { GenrerInterface } from '../../../../genres/genre.interface';
import { MultimediasMetadaInterface } from '../../../../multimedias/interfaces/multimediasMetadata.interface';
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
  multimedia: MultimediasMetadaInterface;
  tags: TagInterface[];
  genres: GenrerInterface[];
  created_at: Date;
  updated_at: Date;
}
