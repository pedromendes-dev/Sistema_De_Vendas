import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScreenAdapter } from '@/hooks/useScreenAdapter';
import { AdaptiveCard } from '@/components/AdaptiveContainer';
import { Users, DollarSign, Target, Trophy, Shield, Layout, Settings, Grip } from 'lucide-react';

export default function AdminAdaptationDemo() {
  const { metrics, classes, breakpoint } = useScreenAdapter();

  const tabs = [
    { value: 'attendants', icon: Users, label: 'Atendentes' },
    { value: 'sales', icon: DollarSign, label: 'Vendas' },
    { value: 'goals', icon: Target, label: 'Metas' },
    { value: 'achievements', icon: Trophy, label: 'Conquistas' },
    { value: 'admins', icon: Shield, label: 'Admins' },
    { value: 'organize', icon: Grip, label: 'Organizar' },
    { value: 'layout', icon: Layout, label: 'Layout' },
    { value: 'configs', icon: Settings, label: 'Config' }
  ];

  const getOptimalTabSize = () => {
    const screenWidth = metrics.width;
    const tabsCount = tabs.length;
    const idealTabWidth = Math.max(80, Math.floor(screenWidth / tabsCount));
    
    return {
      width: idealTabWidth,
      fontSize: metrics.deviceType === 'mobile' ? '12px' : '14px',
      iconSize: metrics.deviceType === 'mobile' ? 14 : 16,
      padding: metrics.deviceType === 'mobile' ? '8px' : '12px'
    };
  };

  const tabSize = getOptimalTabSize();

  return (
    <div className="mb-6">
      <AdaptiveCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className={`${classes.text.replace('-sm', '-lg')} text-primary-light flex items-center gap-2`}>
            🔧 Algoritmo Inteligente Aplicado - Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent className={classes.spacing}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className={`${classes.text} font-medium text-primary-light mb-2`}>
                Adaptação Automática de Tabs
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Largura Otimizada: {tabSize.width}px
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Ícone: {tabSize.iconSize}px
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Dispositivo: {metrics.deviceType}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className={`${classes.text} font-medium text-primary-light mb-2`}>
                Melhorias Aplicadas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-secondary-light">
                    Espaçamento inteligente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-secondary-light">
                    Truncamento de texto adaptativo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-secondary-light">
                    Ícones responsivos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Demonstration of Adaptive Tabs */}
          <div className="bg-secondary-dark border border-border rounded-lg p-2">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
              {tabs.map(({ value, icon: Icon, label }, index) => (
                <div
                  key={value}
                  className={`
                    flex flex-col items-center justify-center gap-1
                    ${classes.card}
                    text-secondary-light
                    transition-all border-0 bg-transparent rounded-md
                    ${index === 0 ? 'text-primary-light bg-primary-dark/30' : ''}
                  `.trim()}
                  style={{
                    minWidth: `${tabSize.width}px`,
                    padding: tabSize.padding,
                    fontSize: tabSize.fontSize
                  }}
                >
                  <Icon size={tabSize.iconSize} className="flex-shrink-0" />
                  <span className="leading-tight text-center truncate w-full">
                    {metrics.deviceType === 'mobile' && label.length > 8 
                      ? label.substring(0, 8) + '...' 
                      : label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className={`${classes.text} text-secondary-light`}>
              ✨ As tabs se adaptam automaticamente ao tamanho da tela e tipo de dispositivo
            </p>
          </div>
        </CardContent>
      </AdaptiveCard>
    </div>
  );
}