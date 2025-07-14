import { useState, useEffect, useCallback } from 'react';

interface ScreenMetrics {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
  density: 'low' | 'medium' | 'high' | 'ultra';
  touchSupport: boolean;
}

interface AdaptiveClasses {
  container: string;
  text: string;
  button: string;
  spacing: string;
  icon: string;
  card: string;
  grid: string;
}

interface ScreenAdapter {
  metrics: ScreenMetrics;
  classes: AdaptiveClasses;
  breakpoint: string;
  isLoading: boolean;
  refresh: () => void;
}

const BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: 1919 },
  ultrawide: { min: 1920, max: Infinity }
};

const DEVICE_DETECTION = {
  mobile: [
    /Android.*Mobile/i,
    /iPhone/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Opera Mini/i,
    /Mobile Safari/i
  ],
  tablet: [
    /iPad/i,
    /Android(?!.*Mobile)/i,
    /Tablet/i,
    /Kindle/i,
    /Silk/i
  ]
};

function detectDeviceType(width: number, userAgent: string): ScreenMetrics['deviceType'] {
  // Check user agent first for mobile devices
  if (DEVICE_DETECTION.mobile.some(regex => regex.test(userAgent))) {
    return 'mobile';
  }
  
  if (DEVICE_DETECTION.tablet.some(regex => regex.test(userAgent))) {
    return 'tablet';
  }
  
  // Fallback to screen width
  if (width < BREAKPOINTS.tablet.min) return 'mobile';
  if (width < BREAKPOINTS.desktop.min) return 'tablet';
  if (width < BREAKPOINTS.ultrawide.min) return 'desktop';
  return 'ultrawide';
}

function detectDensity(devicePixelRatio: number): ScreenMetrics['density'] {
  if (devicePixelRatio <= 1) return 'low';
  if (devicePixelRatio <= 2) return 'medium';
  if (devicePixelRatio <= 3) return 'high';
  return 'ultra';
}

function generateAdaptiveClasses(metrics: ScreenMetrics): AdaptiveClasses {
  const { width, deviceType, density, orientation } = metrics;
  
  // Base classes for different screen sizes
  const baseClasses = {
    mobile: {
      container: 'container-universal px-2 sm:px-4',
      text: 'text-universal-sm',
      button: 'btn-universal-sm',
      spacing: 'space-universal-sm',
      icon: 'icon-universal-sm',
      card: 'card-universal p-3',
      grid: 'mobile-grid-2'
    },
    tablet: {
      container: 'container-universal px-4 md:px-6',
      text: 'text-universal-md',
      button: 'btn-universal-md',
      spacing: 'space-universal-md',
      icon: 'icon-universal-md',
      card: 'card-universal p-4',
      grid: 'mobile-grid-3'
    },
    desktop: {
      container: 'container-universal px-6 lg:px-8',
      text: 'text-universal-lg',
      button: 'btn-universal-lg',
      spacing: 'space-universal-lg',
      icon: 'icon-universal-lg',
      card: 'card-universal p-6',
      grid: 'mobile-grid-auto'
    },
    ultrawide: {
      container: 'container-universal px-8 xl:px-12 max-w-7xl',
      text: 'text-universal-xl',
      button: 'btn-universal-lg',
      spacing: 'space-universal-xl',
      icon: 'icon-universal-xl',
      card: 'card-universal p-8',
      grid: 'grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    }
  };

  let classes = { ...baseClasses[deviceType] };

  // Adjust for ultra-small screens
  if (width <= 320) {
    classes = {
      ...classes,
      container: 'container-universal px-1',
      text: 'text-universal-xs',
      button: 'btn-universal-xs',
      spacing: 'space-universal-xs',
      icon: 'icon-universal-xs',
      card: 'card-universal p-2',
      grid: 'grid-cols-1'
    };
  }

  // Adjust for high-density screens
  if (density === 'ultra') {
    classes.text = classes.text.replace('universal-', 'universal-');
    classes.icon = classes.icon.replace('sm', 'md').replace('md', 'lg');
  }

  // Adjust for landscape orientation on mobile
  if (deviceType === 'mobile' && orientation === 'landscape') {
    classes.spacing = 'space-universal-xs';
    classes.card = 'card-universal p-2';
  }

  return classes;
}

export function useScreenAdapter(): ScreenAdapter {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ScreenMetrics>({
    width: 0,
    height: 0,
    devicePixelRatio: 1,
    orientation: 'portrait',
    deviceType: 'mobile',
    density: 'medium',
    touchSupport: false
  });

  const calculateMetrics = useCallback((): ScreenMetrics => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const orientation = width > height ? 'landscape' : 'portrait';
    const deviceType = detectDeviceType(width, navigator.userAgent);
    const density = detectDensity(devicePixelRatio);
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      width,
      height,
      devicePixelRatio,
      orientation,
      deviceType,
      density,
      touchSupport
    };
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    const newMetrics = calculateMetrics();
    setMetrics(newMetrics);
    setIsLoading(false);
  }, [calculateMetrics]);

  useEffect(() => {
    // Initial calculation
    refresh();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(refresh, 150);
    };

    // Listen to resize and orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Listen to device pixel ratio changes (zoom)
    const mediaQuery = window.matchMedia('(resolution: 1dppx)');
    mediaQuery.addEventListener('change', refresh);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      mediaQuery.removeEventListener('change', refresh);
    };
  }, [refresh]);

  const classes = generateAdaptiveClasses(metrics);
  
  const breakpoint = Object.entries(BREAKPOINTS).find(
    ([, range]) => metrics.width >= range.min && metrics.width <= range.max
  )?.[0] || 'mobile';

  return {
    metrics,
    classes,
    breakpoint,
    isLoading,
    refresh
  };
}

// Hook for component-specific adaptations
export function useComponentAdapter(componentType: 'card' | 'button' | 'text' | 'grid' | 'modal') {
  const { metrics, classes, breakpoint } = useScreenAdapter();
  
  const getComponentClasses = useCallback(() => {
    const baseClasses = {
      card: `${classes.card} ${classes.spacing}`,
      button: `${classes.button} ${classes.spacing}`,
      text: classes.text,
      grid: `${classes.grid} gap-${classes.spacing.split('-').pop()}`,
      modal: `${classes.card} max-w-${metrics.deviceType === 'mobile' ? 'sm' : 'md'}`
    };

    let componentClasses = baseClasses[componentType] || '';

    // Add device-specific optimizations
    if (metrics.touchSupport) {
      componentClasses += ' touch-manipulation cursor-pointer';
    }

    if (metrics.deviceType === 'mobile') {
      componentClasses += ' active:scale-95 transition-transform';
    }

    return componentClasses;
  }, [metrics, classes, componentType]);

  return {
    classes: getComponentClasses(),
    isMobile: metrics.deviceType === 'mobile',
    isTablet: metrics.deviceType === 'tablet',
    isDesktop: metrics.deviceType === 'desktop',
    isTouch: metrics.touchSupport,
    breakpoint,
    metrics
  };
}

// Hook for layout adaptations
export function useLayoutAdapter() {
  const { metrics, classes } = useScreenAdapter();
  
  const getLayoutConfig = useCallback(() => {
    return {
      sidebar: {
        show: metrics.width >= 1024,
        width: metrics.width >= 1440 ? '280px' : '240px',
        position: 'fixed' as const
      },
      navigation: {
        type: metrics.width >= 768 ? 'horizontal' : 'bottom',
        compact: metrics.width < 480
      },
      grid: {
        columns: Math.min(Math.floor(metrics.width / 280), 6),
        gap: metrics.width < 480 ? '8px' : '16px'
      },
      modal: {
        fullscreen: metrics.width < 640,
        maxWidth: metrics.width < 640 ? '100vw' : '500px'
      }
    };
  }, [metrics]);

  return {
    layout: getLayoutConfig(),
    classes,
    metrics
  };
}