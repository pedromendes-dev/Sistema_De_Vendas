import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useScreenAdapter, useComponentAdapter } from '@/hooks/useScreenAdapter';
import { AdaptiveContainer, AdaptiveCard } from '@/components/AdaptiveContainer';
import { AdaptiveGrid } from '@/components/AdaptiveGrid';
import { Monitor, Smartphone, Tablet, Tv, RefreshCw, Info } from 'lucide-react';

export default function ScreenAdaptationDemo() {
  const { metrics, classes, breakpoint, refresh } = useScreenAdapter();
  const { classes: cardClasses, isMobile, isTablet, isDesktop, isTouch } = useComponentAdapter('card');
  const [showDetails, setShowDetails] = useState(false);

  const getDeviceIcon = () => {
    switch (metrics.deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'ultrawide': return <Tv className="w-5 h-5" />;
    }
  };

  const getDensityColor = () => {
    switch (metrics.density) {
      case 'low': return 'bg-gray-500';
      case 'medium': return 'bg-blue-500';
      case 'high': return 'bg-green-500';
      case 'ultra': return 'bg-purple-500';
    }
  };

  return (
    <AdaptiveContainer type="section" padding="medium">
      <AdaptiveCard className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-light">
            <Info className="w-5 h-5" />
            Algoritmo Inteligente de Adaptação de Tela
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Screen Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getDeviceIcon()}
                <span className="text-sm font-medium text-primary-light">Dispositivo</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.deviceType}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-primary-light mb-2">Resolução</div>
              <Badge variant="outline" className="text-xs">
                {metrics.width} × {metrics.height}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-primary-light mb-2">Densidade</div>
              <Badge className={`text-xs text-white ${getDensityColor()}`}>
                {metrics.density} ({metrics.devicePixelRatio}x)
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-primary-light mb-2">Orientação</div>
              <Badge variant="outline" className="text-xs">
                {metrics.orientation}
              </Badge>
            </div>
          </div>

          {/* Adaptive Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-primary-light mb-2">Recursos Detectados</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${metrics.touchSupport ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-secondary-light">
                    Suporte a Touch: {metrics.touchSupport ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${breakpoint === 'mobile' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-secondary-light">
                    Breakpoint: {breakpoint}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-primary-light mb-2">Adaptações Ativas</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isMobile ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-secondary-light">Mobile Layout</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isTouch ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-secondary-light">Touch Interactions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Demonstration */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-primary-light">Demonstração Ao Vivo</h4>
              <Button
                onClick={refresh}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Atualizar
              </Button>
            </div>
            
            <AdaptiveGrid minItemWidth={200} maxColumns={3} gap="small">
              <AdaptiveCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="p-4 text-center">
                  <div className="text-lg font-bold text-primary-light mb-2">Tamanho de Texto</div>
                  <div className={classes.text}>
                    Este texto se adapta automaticamente
                  </div>
                </div>
              </AdaptiveCard>
              
              <AdaptiveCard className="bg-gradient-to-r from-green-500/10 to-blue-500/10">
                <div className="p-4 text-center">
                  <div className="text-lg font-bold text-primary-light mb-2">Espaçamento</div>
                  <div className={classes.spacing}>
                    Padding e margin inteligentes
                  </div>
                </div>
              </AdaptiveCard>
              
              <AdaptiveCard className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
                <div className="p-4 text-center">
                  <div className="text-lg font-bold text-primary-light mb-2">Interação</div>
                  <Button 
                    className={`${isTouch ? 'active:scale-95' : 'hover:scale-105'} transition-transform`}
                    size={isMobile ? 'sm' : 'default'}
                  >
                    {isTouch ? 'Touch' : 'Mouse'}
                  </Button>
                </div>
              </AdaptiveCard>
            </AdaptiveGrid>
          </div>

          {/* Technical Details */}
          {showDetails && (
            <div className="border-t border-border pt-4 mt-4">
              <h4 className="text-sm font-medium text-primary-light mb-2">Detalhes Técnicos</h4>
              <div className="bg-accent/20 rounded-lg p-3 text-xs font-mono text-secondary-light">
                <div>Classes Geradas: {classes.container}</div>
                <div>Grid System: {classes.grid}</div>
                <div>Text Scale: {classes.text}</div>
                <div>Button Size: {classes.button}</div>
                <div>Card Padding: {classes.card}</div>
              </div>
            </div>
          )}
          
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="mt-4 text-xs"
          >
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
          </Button>
        </CardContent>
      </AdaptiveCard>
    </AdaptiveContainer>
  );
}