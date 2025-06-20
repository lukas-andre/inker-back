import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheItem {
  data: any;
  timestamp: Date;
}

interface RateLimitBucket {
  count: number;
  resetTime: Date;
}

@Injectable()
export class RateLimiterService {
  private readonly cache = new Map<string, CacheItem>();
  private readonly buckets = new Map<string, RateLimitBucket>();
  private readonly maxRequestsPerMinute: number;
  private readonly maxRequestsPerHour: number;
  private readonly cacheExpiry: number; // in seconds

  constructor(private readonly configService: ConfigService) {
    this.maxRequestsPerMinute = this.configService.get('places.rateLimitPerMinute', 30);
    this.maxRequestsPerHour = this.configService.get('places.rateLimitPerHour', 1000);
    this.cacheExpiry = this.configService.get('places.cacheExpiry', 3600); // 1 hour default
  }

  async tryAcquire(identifier: string = 'global'): Promise<boolean> {
    const now = new Date();
    
    // Check minute bucket
    const minuteKey = `${identifier}:minute`;
    const minuteBucket = this.buckets.get(minuteKey) || { count: 0, resetTime: new Date(now.getTime() + 60000) };
    
    if (now >= minuteBucket.resetTime) {
      // Reset the bucket
      minuteBucket.count = 0;
      minuteBucket.resetTime = new Date(now.getTime() + 60000);
    }
    
    if (minuteBucket.count >= this.maxRequestsPerMinute) {
      return false;
    }
    
    // Check hour bucket
    const hourKey = `${identifier}:hour`;
    const hourBucket = this.buckets.get(hourKey) || { count: 0, resetTime: new Date(now.getTime() + 3600000) };
    
    if (now >= hourBucket.resetTime) {
      // Reset the bucket
      hourBucket.count = 0;
      hourBucket.resetTime = new Date(now.getTime() + 3600000);
    }
    
    if (hourBucket.count >= this.maxRequestsPerHour) {
      return false;
    }
    
    // Increment counters
    minuteBucket.count++;
    hourBucket.count++;
    
    this.buckets.set(minuteKey, minuteBucket);
    this.buckets.set(hourKey, hourBucket);
    
    return true;
  }

  cacheResponse(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
    });
    
    // Clean up old cache entries periodically
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
  }

  getCachedResponse(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    
    const now = new Date();
    const age = (now.getTime() - item.timestamp.getTime()) / 1000; // age in seconds
    
    if (age > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  private cleanupCache(): void {
    const now = new Date();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((item, key) => {
      const age = (now.getTime() - item.timestamp.getTime()) / 1000;
      if (age > this.cacheExpiry) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  getRemainingRequests(identifier: string = 'global'): { minute: number; hour: number } {
    const now = new Date();
    
    const minuteKey = `${identifier}:minute`;
    const minuteBucket = this.buckets.get(minuteKey);
    const minuteRemaining = minuteBucket && now < minuteBucket.resetTime
      ? Math.max(0, this.maxRequestsPerMinute - minuteBucket.count)
      : this.maxRequestsPerMinute;
    
    const hourKey = `${identifier}:hour`;
    const hourBucket = this.buckets.get(hourKey);
    const hourRemaining = hourBucket && now < hourBucket.resetTime
      ? Math.max(0, this.maxRequestsPerHour - hourBucket.count)
      : this.maxRequestsPerHour;
    
    return {
      minute: minuteRemaining,
      hour: hourRemaining,
    };
  }
}