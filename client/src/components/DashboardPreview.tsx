import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  DollarSign, 
  Target, 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Activity,
  Calendar,
  Zap
} from 'lucide-react';

interface Widget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list' | 'progress' | 'calendar';
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  visible: boolean;
  config: {
    dataSource?: string;
    refreshInterval?: number;
    showTrends?: boolean;
    colorScheme?: string;
    displayMode?: string;
  };
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  columns: number;
  spacing: 'compact' | 'normal' | 'spacious';
}

interface DashboardPreviewProps {
  layout: DashboardLayout;
  isPreview?: boolean;
}

const colorSchemeClasses = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
  green: 'bg-green-500/10 border-green-500/20 text-green-600',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-600',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-600',
  red: 'bg-red-500/10 border-red-500/20 text-red-600',
  gradient: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 text-blue-600'
};

export default function DashboardPreview({ layout, isPreview = false }: DashboardPreviewProps) {
  // Fetch real data for widgets
  const { data: attendants = [] } = useQuery<any[]>({ queryKey: ['/api/attendants'] });
  const { data: sales = [] } = useQuery<any[]>({ queryKey: ['/api/sales'] });
  const { data: goals = [] } = useQuery<any[]>({ queryKey: ['/api/goals'] });
  const { data: achievements = [] } = useQuery<any[]>({ queryKey: ['/api/achievements'] });

  // Get widget data based on data source
  const getWidgetData = (widget: Widget) => {
    switch (widget.config.dataSource) {
      case '/api/attendants':
        return {
          count: attendants.length,
          items: attendants,
          label: 'Atendentes'
        };
      case '/api/sales':
        return {
          count: sales.length,
          items: sales,
          label: 'Vendas',
          total: sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.value || 0), 0)
        };
      case '/api/goals':
        return {
          count: goals.filter((goal: any) => goal.isActive).length,
          items: goals,
          label: 'Metas Ativas'
        };
      case '/api/achievements':
        return {
          count: achievements.length,
          items: achievements,
          label: 'Conquistas'
        };
      default:
        return { count: 0, items: [], label: 'Dados' };
    }
  };

  // Calculate grid classes based on layout settings
  const getGridClasses = () => {
    const baseClass = 'grid gap-4';
    const columnsClass = `grid-cols-1 md:grid-cols-${Math.min(layout.columns, 4)} lg:grid-cols-${layout.columns}`;
    
    const spacingClasses = {
      compact: 'gap-2',
      normal: 'gap-4',
      spacious: 'gap-6'
    };

    return `${baseClass} ${columnsClass} ${spacingClasses[layout.spacing]}`;
  };

  // Get widget size classes
  const getSizeClasses = (size: Widget['size']) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-2';
      case 'large':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'full':
        return `col-span-1 md:col-span-${Math.min(layout.columns, 4)} lg:col-span-${layout.columns}`;
      default:
        return 'col-span-1';
    }
  };

  // Render individual widget
  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null;

    const data = getWidgetData(widget);
    const colorClass = colorSchemeClasses[widget.config.colorScheme as keyof typeof colorSchemeClasses] || colorSchemeClasses.blue;
    const sizeClass = getSizeClasses(widget.size);

    switch (widget.type) {
      case 'stat':
        return (
          <Card key={widget.id} className={`${sizeClass} ${colorClass} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-80">{widget.title}</h3>
                  <div className="text-2xl font-bold mt-2">
                    {widget.config.dataSource === '/api/sales' && data.total ? 
                      `R$ ${data.total.toFixed(2)}` : 
                      data.count.toLocaleString()
                    }
                  </div>
                  {widget.config.showTrends && (
                    <div className="flex items-center gap-1 mt-2 text-sm opacity-70">
                      <TrendingUp size={14} />
                      +12.5% este mês
                    </div>
                  )}
                </div>
                <div className="opacity-60">
                  {widget.config.dataSource === '/api/attendants' && <Users size={24} />}
                  {widget.config.dataSource === '/api/sales' && <DollarSign size={24} />}
                  {widget.config.dataSource === '/api/goals' && <Target size={24} />}
                  {widget.config.dataSource === '/api/achievements' && <Trophy size={24} />}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'chart':
        return (
          <Card key={widget.id} className={`${sizeClass}`}>
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Gráfico de {data.label}
                    {isPreview && <br />}
                    <span className="text-xs">(Visualização)</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <Card key={widget.id} className={`${sizeClass}`}>
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.items.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {item.name || item.title || `Item ${index + 1}`}
                        </p>
                        {item.value && (
                          <p className="text-sm text-muted-foreground">R$ {parseFloat(item.value).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                    {item.earnings && (
                      <Badge variant="outline">
                        R$ {parseFloat(item.earnings).toFixed(2)}
                      </Badge>
                    )}
                  </div>
                ))}
                {data.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity size={32} className="mx-auto mb-2" />
                    <p>Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'progress':
        return (
          <Card key={widget.id} className={`${sizeClass}`}>
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.items.slice(0, 3).map((item: any, index: number) => {
                  const progress = Math.random() * 100; // Mock progress for preview
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{item.name || item.title || `Meta ${index + 1}`}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            widget.config.colorScheme === 'green' ? 'bg-green-500' :
                            widget.config.colorScheme === 'blue' ? 'bg-blue-500' :
                            widget.config.colorScheme === 'orange' ? 'bg-orange-500' :
                            'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 'calendar':
        return (
          <Card key={widget.id} className={`${sizeClass}`}>
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Widget de Calendário
                    {isPreview && <br />}
                    <span className="text-xs">(Visualização)</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Sort widgets by position for proper grid layout
  const sortedWidgets = [...layout.widgets].sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });

  return (
    <div className="space-y-6">
      {isPreview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Zap size={20} />
            <h3 className="font-semibold">Visualização do Dashboard</h3>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Esta é uma prévia de como seu dashboard personalizado aparecerá na página inicial.
          </p>
        </div>
      )}

      <div className={getGridClasses()}>
        {sortedWidgets.map(renderWidget)}
      </div>

      {layout.widgets.filter(w => w.visible).length === 0 && (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Nenhum widget visível
          </h3>
          <p className="text-muted-foreground">
            Adicione widgets ou torne alguns visíveis para ver seu dashboard personalizado.
          </p>
        </div>
      )}
    </div>
  );
}