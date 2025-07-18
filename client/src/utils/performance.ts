// Performance utilities for the application

// Debounce function to limit API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Lazy load images with intersection observer
export function lazyLoadImages(selector: string = 'img[data-src]') {
  const images = document.querySelectorAll(selector);
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Measure performance of async functions
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > 100) {
      console.warn(`[PERF] ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[PERF] ${name} failed after ${duration.toFixed(2)}ms`);
    throw error;
  }
}

// Optimize list rendering with virtualization hint
export function shouldVirtualize(itemCount: number, itemHeight: number): boolean {
  const viewportHeight = window.innerHeight;
  const totalHeight = itemCount * itemHeight;
  
  // Virtualize if list height is more than 3x viewport
  return totalHeight > viewportHeight * 3;
}

// Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Memory cleanup for components
export function cleanupMemory() {
  // Clear image cache
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete) {
      img.src = '';
    }
  });
  
  // Clear any data attributes
  const elements = document.querySelectorAll('[data-temp]');
  elements.forEach(el => {
    el.removeAttribute('data-temp');
  });
  
  // Trigger garbage collection hint (if available)
  if ('gc' in window) {
    (window as any).gc();
  }
}