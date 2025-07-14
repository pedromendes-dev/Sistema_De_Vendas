import React from 'react';
import { useScreenAdapter } from '@/hooks/useScreenAdapter';

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  minItemWidth?: number;
  maxColumns?: number;
  gap?: 'small' | 'medium' | 'large';
  type?: 'auto' | 'fixed' | 'masonry';
}

export function AdaptiveGrid({ 
  children, 
  className = '', 
  minItemWidth = 280,
  maxColumns = 6,
  gap = 'medium',
  type = 'auto'
}: AdaptiveGridProps) {
  const { metrics, classes } = useScreenAdapter();

  const getGridClasses = () => {
    let gridClasses = 'grid w-full';

    // Calculate optimal columns based on screen width
    const availableWidth = metrics.width - 32; // Account for padding
    const optimalColumns = Math.min(
      Math.floor(availableWidth / minItemWidth),
      maxColumns
    );

    // Ensure at least 1 column
    const columns = Math.max(1, optimalColumns);

    // Grid type specific classes
    switch (type) {
      case 'auto':
        gridClasses += ` grid-cols-${Math.min(columns, 4)} md:grid-cols-${Math.min(columns, 6)}`;
        break;
      case 'fixed':
        gridClasses += ` ${classes.grid}`;
        break;
      case 'masonry':
        gridClasses += ' grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        break;
    }

    // Gap classes
    const gapClasses = {
      small: 'gap-2 md:gap-3',
      medium: 'gap-3 md:gap-4 lg:gap-6',
      large: 'gap-4 md:gap-6 lg:gap-8'
    };
    gridClasses += ` ${gapClasses[gap]}`;

    // Device-specific optimizations
    if (metrics.deviceType === 'mobile') {
      gridClasses += ' constrain-all';
      
      // Force single column on very small screens
      if (metrics.width <= 320) {
        gridClasses = gridClasses.replace(/grid-cols-\d+/g, 'grid-cols-1');
      }
    }

    return `${gridClasses} ${className}`.trim();
  };

  return (
    <div 
      className={getGridClasses()}
      style={{
        gridTemplateColumns: type === 'auto' 
          ? `repeat(auto-fit, minmax(min(${minItemWidth}px, 100%), 1fr))`
          : undefined
      }}
    >
      {children}
    </div>
  );
}

// Specialized grid components
export function AdaptiveAttendantGrid({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <AdaptiveGrid 
      minItemWidth={280} 
      maxColumns={4} 
      gap="medium" 
      className={className}
    >
      {children}
    </AdaptiveGrid>
  );
}

export function AdaptiveStatsGrid({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const { metrics } = useScreenAdapter();
  
  const minWidth = metrics.deviceType === 'mobile' ? 140 : 200;
  
  return (
    <AdaptiveGrid 
      minItemWidth={minWidth} 
      maxColumns={4} 
      gap="small" 
      className={className}
    >
      {children}
    </AdaptiveGrid>
  );
}

export function AdaptiveTabGrid({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const { metrics } = useScreenAdapter();
  
  // Calculate tab width based on screen size
  const tabMinWidth = Math.max(80, Math.floor(metrics.width / 8));
  
  return (
    <AdaptiveGrid 
      minItemWidth={tabMinWidth} 
      maxColumns={8} 
      gap="small" 
      type="auto"
      className={`overflow-x-auto ${className}`}
    >
      {children}
    </AdaptiveGrid>
  );
}