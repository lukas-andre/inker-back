import { PostInterface } from '../posts/domain/services/intercaces/post.inteface';

export interface CustomerFeedInterface {
  posts: PostInterface;
  position: number;
}
