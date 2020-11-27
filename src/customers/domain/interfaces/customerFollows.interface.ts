export interface FollowTopic {
  id: string;
  name: string;
}

export interface CustomerFollows {
  genres?: FollowTopic[];
  tags?: FollowTopic[];
  artist?: FollowTopic[];
}
