export enum WorkSource {
  APP = 'APP',
  EXTERNAL = 'EXTERNAL',
}

export interface WorkType {
  id?: string;
  artistId: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageVersion: number;
  thumbnailUrl?: string;
  thumbnailVersion: number;
  isFeatured: boolean;
  orderPosition: number;
  source?: WorkSource;
  isHidden?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}