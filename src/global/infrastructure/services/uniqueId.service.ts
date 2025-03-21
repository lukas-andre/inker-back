import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

/**
 * Service for generating unique identifiers across the application
 */
@Injectable()
export class UniqueIdService {
  /**
   * Generates a unique image ID suitable for use in file paths
   * Creates a composite ID from UUID and timestamp to ensure uniqueness
   * 
   * @returns A unique image identifier (18 chars total)
   */
  generateImageId(): string {
    // First 12 chars of UUID without dashes
    const uuid = uuidv4().replace(/-/g, '').substring(0, 12);
    
    // 6 chars from timestamp hash for additional uniqueness
    const timestamp = Date.now().toString();
    const timestampHash = crypto.createHash('md5')
      .update(timestamp)
      .digest('hex')
      .substring(0, 6);
    
    // Combine for a total of 18 chars
    return `${uuid}${timestampHash}`;
  }

  /**
   * Generates a simple UUID v4
   * 
   * @returns A UUID v4 string
   */
  generateUuid(): string {
    return uuidv4();
  }

  /**
   * Creates a hash of the input string using the specified algorithm
   * 
   * @param input - The string to hash
   * @param algorithm - The hashing algorithm to use (default: 'md5')
   * @returns The hash string
   */
  generateHash(input: string, algorithm: 'md5' | 'sha256' = 'md5'): string {
    return crypto.createHash(algorithm).update(input).digest('hex');
  }
} 