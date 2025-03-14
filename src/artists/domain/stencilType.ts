export enum StencilStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  USED = 'USED',
}

export interface StencilType {
  id?: number;
  artistId: number;
  title: string;
  description?: string;
  imageUrl: string;
  imageVersion: number;
  thumbnailUrl?: string;
  thumbnailVersion: number;
  isFeatured: boolean;
  orderPosition: number;
  price?: number;
  status?: StencilStatus;
  isHidden?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}