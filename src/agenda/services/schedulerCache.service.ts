import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SchedulerCacheService {
  private readonly CACHE_PREFIXES = {
    AVAILABILITY: 'availability:',
    SUGGESTIONS: 'suggestions:',
    SCHEDULER_VIEW: 'scheduler:',
    DENSITY: 'density:',
    QUOTATIONS: 'quotations:',
  };

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateArtistCache(artistId: string): Promise<void> {
    // Get all keys and filter by artist ID
    const keys = await this.getAllCacheKeys();
    const artistKeys = keys.filter(key => key.includes(artistId));
    
    // Delete all artist-related cache entries
    await Promise.all(artistKeys.map(key => this.cacheManager.del(key)));
  }

  async invalidateAvailabilityCache(artistId: string): Promise<void> {
    const keys = await this.getAllCacheKeys();
    const availabilityKeys = keys.filter(key => 
      key.startsWith(this.CACHE_PREFIXES.AVAILABILITY) && key.includes(artistId)
    );
    
    await Promise.all(availabilityKeys.map(key => this.cacheManager.del(key)));
  }

  async invalidateSuggestionsCache(artistId: string): Promise<void> {
    const keys = await this.getAllCacheKeys();
    const suggestionKeys = keys.filter(key => 
      key.startsWith(this.CACHE_PREFIXES.SUGGESTIONS) && key.includes(artistId)
    );
    
    await Promise.all(suggestionKeys.map(key => this.cacheManager.del(key)));
  }

  async invalidateDensityCache(artistId: string, date?: Date): Promise<void> {
    const keys = await this.getAllCacheKeys();
    let densityKeys = keys.filter(key => 
      key.startsWith(this.CACHE_PREFIXES.DENSITY) && key.includes(artistId)
    );
    
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      densityKeys = densityKeys.filter(key => key.includes(dateStr));
    }
    
    await Promise.all(densityKeys.map(key => this.cacheManager.del(key)));
  }

  async getCachedAvailability(
    artistId: string, 
    fromDate: string, 
    toDate: string, 
    duration: number
  ): Promise<any | null> {
    const key = `${this.CACHE_PREFIXES.AVAILABILITY}${artistId}:${fromDate}:${toDate}:${duration}`;
    return this.cacheManager.get(key);
  }

  async setCachedAvailability(
    artistId: string, 
    fromDate: string, 
    toDate: string, 
    duration: number,
    data: any,
    ttl: number = 3600
  ): Promise<void> {
    const key = `${this.CACHE_PREFIXES.AVAILABILITY}${artistId}:${fromDate}:${toDate}:${duration}`;
    await this.cacheManager.set(key, data, ttl);
  }

  async getCachedSuggestions(artistId: string, duration: number): Promise<any | null> {
    const key = `${this.CACHE_PREFIXES.SUGGESTIONS}${artistId}:${duration}`;
    return this.cacheManager.get(key);
  }

  async setCachedSuggestions(
    artistId: string, 
    duration: number, 
    data: any,
    ttl: number = 1800
  ): Promise<void> {
    const key = `${this.CACHE_PREFIXES.SUGGESTIONS}${artistId}:${duration}`;
    await this.cacheManager.set(key, data, ttl);
  }

  async getCachedDensity(
    artistId: string, 
    date: string, 
    timeSlot: string
  ): Promise<number | null> {
    const key = `${this.CACHE_PREFIXES.DENSITY}${artistId}:${date}:${timeSlot}`;
    return this.cacheManager.get(key);
  }

  async setCachedDensity(
    artistId: string, 
    date: string, 
    timeSlot: string, 
    density: number,
    ttl: number = 7200
  ): Promise<void> {
    const key = `${this.CACHE_PREFIXES.DENSITY}${artistId}:${date}:${timeSlot}`;
    await this.cacheManager.set(key, density, ttl);
  }

  private async getAllCacheKeys(): Promise<string[]> {
    // This is a simplified implementation
    // In production, you might want to use Redis KEYS or SCAN commands
    // For now, we'll return an empty array as cache-manager doesn't expose keys
    return [];
  }

  async warmupCache(artistId: string): Promise<void> {
    // This method can be called to pre-populate cache
    // Useful for VIP artists or during off-peak hours
    this.logger.info(`Warming up cache for artist ${artistId}`);
  }

  private logger = {
    info: (msg: string) => console.log(`[SchedulerCache] ${msg}`),
    error: (msg: string, error?: any) => console.error(`[SchedulerCache] ${msg}`, error),
  };
}