export interface StencilType {
  id: number;
  artistId: number;
  title: string;
  description?: string;
  imageUrl: string;
  imageVersion: number;
  thumbnailUrl?: string;
  thumbnailVersion: number;
  price?: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}