import { Injectable } from '@nestjs/common';

import { CloudflareImagesClient } from '../../global/infrastructure/clients/cloudflare-images.client';
import { FileInterface } from '../interfaces/file.interface';
import {
  StorageStrategy,
  StorageUploadResult,
} from '../interfaces/storage-strategy.interface';

@Injectable()
export class CloudflareStorageStrategy implements StorageStrategy {
  constructor(private readonly cloudflareClient: CloudflareImagesClient) {}

  async upload(
    file: FileInterface,
    path: string,
    metadata?: Record<string, string>,
  ): Promise<StorageUploadResult> {
    // Convert path structure to metadata
    const pathMetadata = this.extractMetadataFromPath(path);
    const combinedMetadata = {
      ...pathMetadata,
      ...metadata,
      originalPath: path,
      uploadedAt: new Date().toISOString(),
    };

    // Validate file size (Cloudflare limit is 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error(
        `File size exceeds Cloudflare's 10MB limit. File size: ${file.size} bytes`,
      );
    }

    // Upload to Cloudflare
    const result = await this.cloudflareClient.upload(
      file.buffer,
      file.originalname,
      combinedMetadata,
    );

    // Get the public URL with default variant
    const url = this.cloudflareClient.getImageUrl(result.id, 'public');

    return {
      url,
      id: result.id,
      metadata: {
        ...combinedMetadata,
        cloudflareId: result.id,
        variants: result.variants,
        uploaded: result.uploaded,
      },
    };
  }

  async delete(identifier: string): Promise<void> {
    // For Cloudflare, the identifier is the image ID
    await this.cloudflareClient.delete(identifier);
  }

  getUrl(identifier: string, options?: Record<string, any>): string {
    const variant = options?.variant || 'public';
    return this.cloudflareClient.getImageUrl(identifier, variant);
  }

  private extractMetadataFromPath(path: string): Record<string, string> {
    const metadata: Record<string, string> = {};

    // Parse different path patterns
    if (path.includes('artist/posts/')) {
      // Pattern: artist/posts/{artistId}/{postId}_{index}
      const match = path.match(/artist\/posts\/([^\/]+)\/([^_]+)_(\d+)/);
      if (match) {
        metadata.type = 'post';
        metadata.artistId = match[1];
        metadata.postId = match[2];
        metadata.index = match[3];
      }
    } else if (path.includes('work-evidence')) {
      // Pattern: agenda/{agendaId}/event/{eventId}/work-evidence/file_{index}
      const match = path.match(
        /agenda\/([^\/]+)\/event\/([^\/]+)\/work-evidence\/file_(\d+)/,
      );
      if (match) {
        metadata.type = 'work-evidence';
        metadata.agendaId = match[1];
        metadata.eventId = match[2];
        metadata.index = match[3];
      }
    } else if (path.includes('reference-images')) {
      // Pattern: quotation/{quotationId}/artist/{artistId}/reference-images/reference_{index}
      const match = path.match(
        /quotation\/([^\/]+)\/artist\/([^\/]+)\/reference-images\/reference_(\d+)/,
      );
      if (match) {
        metadata.type = 'reference-image';
        metadata.quotationId = match[1];
        metadata.artistId = match[2];
        metadata.index = match[3];
      }
    } else if (path.includes('proposed-images')) {
      // Pattern: quotation/{quotationId}/artist/{artistId}/proposed-images/proposed_{index}
      const match = path.match(
        /quotation\/([^\/]+)\/artist\/([^\/]+)\/proposed-images\/proposed_(\d+)/,
      );
      if (match) {
        metadata.type = 'proposed-image';
        metadata.quotationId = match[1];
        metadata.artistId = match[2];
        metadata.index = match[3];
      }
    } else if (path.includes('proposed-designs')) {
      // Pattern: quotation/{quotationId}/artist/{artistId}/proposed-designs/design_{index}
      const match = path.match(
        /quotation\/([^\/]+)\/artist\/([^\/]+)\/proposed-designs\/design_(\d+)/,
      );
      if (match) {
        metadata.type = 'proposed-design';
        metadata.quotationId = match[1];
        metadata.artistId = match[2];
        metadata.index = match[3];
      }
    } else {
      // Generic path handling
      metadata.type = 'generic';
      metadata.path = path;
    }

    return metadata;
  }
}
