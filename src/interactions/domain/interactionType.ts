export interface InteractionType {
  id: string;
  userId: string;
  interactionType: string; // 'view', 'like', 'save', 'share'
  entityType: string; // 'artist', 'work', 'stencil'
  entityId: string;
  createdAt: Date;
}
