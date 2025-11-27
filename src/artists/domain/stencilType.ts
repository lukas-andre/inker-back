export enum StencilStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  USED = 'USED',
}

export interface StencilType {
  id?: string;
  artistId: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageId: string;
  imageVersion: number;
  thumbnailUrl?: string;
  thumbnailVersion: number;
  isFeatured: boolean;
  orderPosition: number;
  price?: number;
  status?: StencilStatus;
  isHidden?: boolean;
  dimensions?: { width: number; height: number };
  recommendedPlacements?: string;
  estimatedTime?: number;
  isCustomizable?: boolean;
  isDownloadable?: boolean;
  license?: string;
  licenseUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
