import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';

export interface CloudflareImageUploadResult {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}

export interface CloudflareImageMetadata {
  [key: string]: string;
}

export interface CloudflareErrorResponse {
  success: false;
  errors: Array<{
    code: number;
    message: string;
  }>;
}

@Injectable()
export class CloudflareImagesClient {
  private readonly logger = new Logger(CloudflareImagesClient.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly deliveryUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('cloudflare.accountId');
    const apiToken = this.configService.get<string>('cloudflare.apiToken');

    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
    this.deliveryUrl = this.configService.get<string>(
      'cloudflare.imagesDeliveryUrl',
    );

    this.axiosInstance = axios.create({
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
  }

  async upload(
    buffer: Buffer,
    filename: string,
    metadata?: CloudflareImageMetadata,
  ): Promise<CloudflareImageUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', buffer, filename);

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await this.axiosInstance.post(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (!response.data.success) {
        throw new Error(
          `Cloudflare API error: ${JSON.stringify(response.data.errors)}`,
        );
      }

      return response.data.result;
    } catch (error) {
      this.logger.error('Failed to upload image to Cloudflare', error);

      if (axios.isAxiosError(error) && error.response?.data) {
        const cfError = error.response.data as CloudflareErrorResponse;

        // Handle specific Cloudflare errors
        if (cfError.errors?.length > 0) {
          const firstError = cfError.errors[0];

          switch (firstError.code) {
            case 5415:
              throw new Error(
                'Unsupported image format. Supported formats: JPEG, PNG, WebP, GIF, SVG',
              );
            case 5413:
              throw new Error('Image too large. Maximum size is 10MB');
            case 5455:
              throw new Error('Image format not supported');
            case 5559:
              throw new Error(
                'Cloudflare API temporarily unavailable. Please retry',
              );
            default:
              throw new Error(`Cloudflare error: ${firstError.message}`);
          }
        }
      }

      throw error;
    }
  }

  async delete(imageId: string): Promise<void> {
    try {
      const response = await this.axiosInstance.delete(
        `${this.baseUrl}/${imageId}`,
      );

      if (!response.data.success) {
        throw new Error(
          `Failed to delete image: ${JSON.stringify(response.data.errors)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete image ${imageId} from Cloudflare`,
        error,
      );
      throw error;
    }
  }

  getImageUrl(imageId: string, variant = 'public'): string {
    return `${this.deliveryUrl}/${imageId}/${variant}`;
  }

  async uploadFromUrl(
    imageUrl: string,
    metadata?: CloudflareImageMetadata,
  ): Promise<CloudflareImageUploadResult> {
    try {
      const formData = new FormData();
      formData.append('url', imageUrl);

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await this.axiosInstance.post(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (!response.data.success) {
        throw new Error(
          `Cloudflare API error: ${JSON.stringify(response.data.errors)}`,
        );
      }

      return response.data.result;
    } catch (error) {
      this.logger.error('Failed to upload image from URL to Cloudflare', error);
      throw error;
    }
  }

  async listImages(
    page = 1,
    perPage = 100,
  ): Promise<{
    images: CloudflareImageUploadResult[];
    total: number;
  }> {
    try {
      const response = await this.axiosInstance.get(this.baseUrl, {
        params: {
          page,
          per_page: perPage,
        },
      });

      if (!response.data.success) {
        throw new Error(
          `Failed to list images: ${JSON.stringify(response.data.errors)}`,
        );
      }

      return {
        images: response.data.result.images,
        total: response.data.result_info.total,
      };
    } catch (error) {
      this.logger.error('Failed to list images from Cloudflare', error);
      throw error;
    }
  }

  async getImageDetails(imageId: string): Promise<CloudflareImageUploadResult> {
    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/${imageId}`,
      );

      if (!response.data.success) {
        throw new Error(
          `Failed to get image details: ${JSON.stringify(
            response.data.errors,
          )}`,
        );
      }

      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to get details for image ${imageId}`, error);
      throw error;
    }
  }

  async updateImage(
    imageId: string,
    metadata?: CloudflareImageMetadata,
    requireSignedURLs?: boolean,
  ): Promise<CloudflareImageUploadResult> {
    try {
      const data: any = {};

      if (metadata !== undefined) {
        data.metadata = metadata;
      }

      if (requireSignedURLs !== undefined) {
        data.requireSignedURLs = requireSignedURLs;
      }

      const response = await this.axiosInstance.patch(
        `${this.baseUrl}/${imageId}`,
        data,
      );

      if (!response.data.success) {
        throw new Error(
          `Failed to update image: ${JSON.stringify(response.data.errors)}`,
        );
      }

      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to update image ${imageId}`, error);
      throw error;
    }
  }
}
