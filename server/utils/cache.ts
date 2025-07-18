import memoizee from 'memoizee';

// Cache configuration
const CACHE_TTL = 60 * 1000; // 60 seconds
const CACHE_MAX_SIZE = 100;

// Create memoized function with TTL
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    ttl?: number;
    maxSize?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  return memoizee(fn, {
    promise: true,
    maxAge: options?.ttl || CACHE_TTL,
    max: options?.maxSize || CACHE_MAX_SIZE,
    normalizer: options?.keyGenerator || JSON.stringify,
    preFetch: 0.5, // Prefetch when 50% of TTL has passed
  }) as T;
}

// Cache manager for manual control
export class CacheManager {
  private static caches: Map<string, any> = new Map();

  static register(key: string, cachedFunction: any): void {
    this.caches.set(key, cachedFunction);
  }

  static clear(key?: string): void {
    if (key) {
      const cache = this.caches.get(key);
      if (cache?.clear) cache.clear();
    } else {
      // Clear all caches
      this.caches.forEach(cache => {
        if (cache?.clear) cache.clear();
      });
    }
  }

  static getCacheStats(key: string): any {
    const cache = this.caches.get(key);
    if (cache?.statistics) {
      return cache.statistics();
    }
    return null;
  }
}

// Performance monitoring
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        
        if (duration > 100) { // Log slow operations
          console.warn(`[PERF] ${name}.${propertyKey} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`[PERF] ${name}.${propertyKey} failed after ${duration.toFixed(2)}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}