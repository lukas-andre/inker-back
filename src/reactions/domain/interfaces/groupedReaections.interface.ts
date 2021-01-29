export interface GroupedReactionsInterface {
  reactions: GroupedReactionInterface[];
  group_total: string;
  reaction_type: string;
}

export interface GroupedReactionInterface {
  reaction_type: string;
  user_id: number;
  user_type_id: number;
  user_type: string;
  profile_thumbnail?: string;
  username: string;
}
