export interface InteractionType {
  id: number;
  userId: number;
  interactionType: string; // 'view', 'like', 'save', 'share'
  entityType: string; // 'artist', 'work', 'stencil'
  entityId: number;
  createdAt: Date;
}