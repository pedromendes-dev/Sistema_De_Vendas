import React from 'react';
import { useScreenAdapter } from '@/hooks/useScreenAdapter';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  type?: 'page' | 'section' | 'card' | 'modal';
  padding?: 'none' | 'small' | 'medium' | 'large';
  maxWidth?: 'full' | 'screen' | 'container' | 'content';
}

export function AdaptiveContainer({ 
  children, 
  className = '', 
  type = 'section',
  padding = 'medium',
  maxWidth = 'container'
}: AdaptiveContainerProps) {
  const { classes, metrics, breakpoint } = useScreenAdapter();

  const getContainerClasses = () => {
    let baseClasses = 'w-full';

    // Base container type
    switch (type) {
      case 'page':
        baseClasses += ` ${classes.container} min-h-screen`;
        break;
      case 'section':
        baseClasses += ` ${classes.container}`;
        break;
      case 'card':
        baseClasses += ` ${classes.card}`;
        break;
      case 'modal':
        baseClasses += ` ${classes.card} modal-container`;
        break;
    }

    // Padding
    const paddingClasses = {
      none: '',
      small: classes.spacing.replace('universal', 'universal-sm'),
      medium: classes.spacing,
      large: classes.spacing.replace('universal', 'universal-lg')
    };
    baseClasses += ` ${paddingClasses[padding]}`;

    // Max width
    const maxWidthClasses = {
      full: 'max-w-full',
      screen: 'max-w-screen-2xl',
      container: metrics.deviceType === 'ultrawide' ? 'max-w-7xl' : 'max-w-full',
      content: 'max-w-4xl'
    };
    baseClasses += ` ${maxWidthClasses[maxWidth]}`;

    // Device-specific optimizations
    if (metrics.deviceType === 'mobile') {
      baseClasses += ' constrain-all';
    }

    if (metrics.touchSupport) {
      baseClasses += ' touch-pan-y';
    }

    return `${baseClasses} ${className}`.trim();
  };

  return (
    <div 
      className={getContainerClasses()}
      data-breakpoint={breakpoint}
      data-device={metrics.deviceType}
      data-orientation={metrics.orientation}
    >
      {children}
    </div>
  );
}

// Specialized adaptive components
export function AdaptivePage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <AdaptiveContainer type="page" className={className}>
      {children}
    </AdaptiveContainer>
  );
}

export function AdaptiveSection({ children, className = '', padding = 'medium' }: { 
  children: React.ReactNode; 
  className?: string; 
  padding?: AdaptiveContainerProps['padding'];
}) {
  return (
    <AdaptiveContainer type="section" padding={padding} className={className}>
      {children}
    </AdaptiveContainer>
  );
}

export function AdaptiveCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { metrics } = useScreenAdapter();
  
  const cardClasses = metrics.deviceType === 'mobile' 
    ? 'mobile-card-shadow active:scale-98 transition-transform touch-manipulation'
    : 'hover:shadow-lg transition-all duration-200';

  return (
    <AdaptiveContainer type="card" className={`${cardClasses} ${className}`}>
      {children}
    </AdaptiveContainer>
  );
}

export function AdaptiveModal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { metrics } = useScreenAdapter();
  
  const modalClasses = metrics.width < 640 
    ? 'fixed inset-0 w-full h-full rounded-none'
    : 'max-w-md mx-auto rounded-lg';

  return (
    <AdaptiveContainer type="modal" className={`${modalClasses} ${className}`}>
      {children}
    </AdaptiveContainer>
  );
}