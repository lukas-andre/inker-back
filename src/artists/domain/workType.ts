export interface WorkType {
  id: number;
  artistId: number;
  title: string;
  description?: string;
  imageUrl: string;
  imageVersion: number;
  thumbnailUrl?: string;
  thumbnailVersion: number;
  isFeatured: boolean;
  orderPosition: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}