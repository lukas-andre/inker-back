import { PostInterface } from '../posts/domain/services/interfaces/post.interface';

export interface CustomerFeedInterface {
  posts: PostInterface;
  position: number;
}
