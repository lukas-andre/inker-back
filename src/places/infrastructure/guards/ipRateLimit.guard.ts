import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

interface IPBucket {
  count: number;
  resetTime: Date;
}

@Injectable()
export class IPRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(IPRateLimitGuard.name);
  private readonly ipBuckets = new Map<string, IPBucket>();
  private readonly maxRequestsPerHour = 200; // Per IP per hour
  private readonly maxRequestsPerMinute = 20; // Per IP per minute

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIP = this.getClientIP(request);

    if (!this.checkRateLimit(clientIP)) {
      this.logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
      throw new HttpException(
        'Rate limit exceeded. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIP(request: Request): string {
    // Get real IP considering proxies
    const forwarded = request.headers['x-forwarded-for'] as string;
    const realIP = request.headers['x-real-ip'] as string;

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return request.connection.remoteAddress || request.ip || 'unknown';
  }

  private checkRateLimit(ip: string): boolean {
    const now = new Date();

    // Check minute bucket
    const minuteKey = `${ip}:minute`;
    const minuteBucket = this.ipBuckets.get(minuteKey) || {
      count: 0,
      resetTime: new Date(now.getTime() + 60000),
    };

    if (now >= minuteBucket.resetTime) {
      minuteBucket.count = 0;
      minuteBucket.resetTime = new Date(now.getTime() + 60000);
    }

    if (minuteBucket.count >= this.maxRequestsPerMinute) {
      return false;
    }

    // Check hour bucket
    const hourKey = `${ip}:hour`;
    const hourBucket = this.ipBuckets.get(hourKey) || {
      count: 0,
      resetTime: new Date(now.getTime() + 3600000),
    };

    if (now >= hourBucket.resetTime) {
      hourBucket.count = 0;
      hourBucket.resetTime = new Date(now.getTime() + 3600000);
    }

    if (hourBucket.count >= this.maxRequestsPerHour) {
      return false;
    }

    // Increment counters
    minuteBucket.count++;
    hourBucket.count++;

    this.ipBuckets.set(minuteKey, minuteBucket);
    this.ipBuckets.set(hourKey, hourBucket);

    // Cleanup old buckets periodically
    if (this.ipBuckets.size > 1000) {
      this.cleanupBuckets();
    }

    return true;
  }

  private cleanupBuckets(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    this.ipBuckets.forEach((bucket, key) => {
      if (now >= bucket.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.ipBuckets.delete(key));
  }

  getRemainingRequests(ip: string): { minute: number; hour: number } {
    const now = new Date();

    const minuteKey = `${ip}:minute`;
    const minuteBucket = this.ipBuckets.get(minuteKey);
    const minuteRemaining =
      minuteBucket && now < minuteBucket.resetTime
        ? Math.max(0, this.maxRequestsPerMinute - minuteBucket.count)
        : this.maxRequestsPerMinute;

    const hourKey = `${ip}:hour`;
    const hourBucket = this.ipBuckets.get(hourKey);
    const hourRemaining =
      hourBucket && now < hourBucket.resetTime
        ? Math.max(0, this.maxRequestsPerHour - hourBucket.count)
        : this.maxRequestsPerHour;

    return {
      minute: minuteRemaining,
      hour: hourRemaining,
    };
  }
}
