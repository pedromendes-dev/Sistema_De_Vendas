import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardPreview from './DashboardPreview';
import { 
  Settings, 
  Grid, 
  BarChart3, 
  Users, 
  DollarSign, 
  Target, 
  Trophy,
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  Zap,
  Eye,
  EyeOff,
  Move,
  Plus,
  Trash2,
  Edit,
  Save,
  RotateCcw
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

const defaultWidgets: Widget[] = [
  {
    id: 'total-attendants',
    title: 'Total de Atendentes',
    type: 'stat',
    size: 'small',
    position: { x: 0, y: 0 },
    visible: true,
    config: {
      dataSource: '/api/attendants',
      refreshInterval: 30,
      showTrends: true,
      colorScheme: 'blue'
    }
  },
  {
    id: 'total-sales',
    title: 'Vendas Realizadas',
    type: 'stat',
    size: 'small',
    position: { x: 1, y: 0 },
    visible: true,
    config: {
      dataSource: '/api/sales',
      refreshInterval: 15,
      showTrends: true,
      colorScheme: 'green'
    }
  },
  {
    id: 'active-goals',
    title: 'Metas Ativas',
    type: 'stat',
    size: 'small',
    position: { x: 2, y: 0 },
    visible: true,
    config: {
      dataSource: '/api/goals',
      refreshInterval: 60,
      showTrends: false,
      colorScheme: 'orange'
    }
  },
  {
    id: 'sales-chart',
    title: 'Gráfico de Vendas',
    type: 'chart',
    size: 'large',
    position: { x: 0, y: 1 },
    visible: true,
    config: {
      dataSource: '/api/sales',
      refreshInterval: 30,
      displayMode: 'line',
      colorScheme: 'gradient'
    }
  },
  {
    id: 'top-performers',
    title: 'Melhores Vendedores',
    type: 'list',
    size: 'medium',
    position: { x: 3, y: 0 },
    visible: true,
    config: {
      dataSource: '/api/attendants',
      refreshInterval: 30,
      displayMode: 'ranking'
    }
  },
  {
    id: 'recent-activity',
    title: 'Atividade Recente',
    type: 'list',
    size: 'medium',
    position: { x: 0, y: 2 },
    visible: false,
    config: {
      dataSource: '/api/sales',
      refreshInterval: 10,
      displayMode: 'timeline'
    }
  }
];

const widgetIcons = {
  stat: BarChart3,
  chart: TrendingUp,
  list: Users,
  progress: Target,
  calendar: Calendar
};

const colorSchemes = [
  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { value: 'green', label: 'Verde', color: 'bg-green-500' },
  { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
  { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
  { value: 'red', label: 'Vermelho', color: 'bg-red-500' },
  { value: 'gradient', label: 'Gradiente', color: 'bg-gradient-to-r from-blue-500 to-purple-500' }
];

export default function DashboardWidgetCustomizer() {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Initialize with default layout
  useEffect(() => {
    const defaultLayout: DashboardLayout = {
      id: 'default',
      name: 'Layout Padrão',
      widgets: defaultWidgets,
      columns: 4,
      spacing: 'normal'
    };
    
    const savedLayouts = localStorage.getItem('dashboardLayouts');
    if (savedLayouts) {
      const parsed = JSON.parse(savedLayouts);
      setLayouts(parsed);
      setCurrentLayout(parsed[0] || defaultLayout);
    } else {
      setLayouts([defaultLayout]);
      setCurrentLayout(defaultLayout);
    }
  }, []);

  // Save layouts to localStorage
  const saveLayouts = (newLayouts: DashboardLayout[]) => {
    setLayouts(newLayouts);
    localStorage.setItem('dashboardLayouts', JSON.stringify(newLayouts));
    toast({
      title: "Layout salvo",
      description: "Suas configurações foram salvas com sucesso.",
    });
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId: string) => {
    if (!currentLayout) return;
    
    const updatedWidgets = currentLayout.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    
    const updatedLayout = { ...currentLayout, widgets: updatedWidgets };
    setCurrentLayout(updatedLayout);
    
    const updatedLayouts = layouts.map(layout =>
      layout.id === currentLayout.id ? updatedLayout : layout
    );
    saveLayouts(updatedLayouts);
  };

  // Update widget configuration
  const updateWidget = (updatedWidget: Widget) => {
    if (!currentLayout) return;
    
    const updatedWidgets = currentLayout.widgets.map(widget =>
      widget.id === updatedWidget.id ? updatedWidget : widget
    );
    
    const updatedLayout = { ...currentLayout, widgets: updatedWidgets };
    setCurrentLayout(updatedLayout);
    
    const updatedLayouts = layouts.map(layout =>
      layout.id === currentLayout.id ? updatedLayout : layout
    );
    saveLayouts(updatedLayouts);
    setEditingWidget(null);
  };

  // Add new widget
  const addWidget = (newWidget: Omit<Widget, 'id'>) => {
    if (!currentLayout) return;
    
    const widget: Widget = {
      ...newWidget,
      id: `widget-${Date.now()}`,
    };
    
    const updatedWidgets = [...currentLayout.widgets, widget];
    const updatedLayout = { ...currentLayout, widgets: updatedWidgets };
    setCurrentLayout(updatedLayout);
    
    const updatedLayouts = layouts.map(layout =>
      layout.id === currentLayout.id ? updatedLayout : layout
    );
    saveLayouts(updatedLayouts);
    setShowAddWidget(false);
  };

  // Remove widget
  const removeWidget = (widgetId: string) => {
    if (!currentLayout) return;
    
    const updatedWidgets = currentLayout.widgets.filter(widget => widget.id !== widgetId);
    const updatedLayout = { ...currentLayout, widgets: updatedWidgets };
    setCurrentLayout(updatedLayout);
    
    const updatedLayouts = layouts.map(layout =>
      layout.id === currentLayout.id ? updatedLayout : layout
    );
    saveLayouts(updatedLayouts);
  };

  // Reset to default layout
  const resetToDefault = () => {
    const defaultLayout: DashboardLayout = {
      id: 'default',
      name: 'Layout Padrão',
      widgets: defaultWidgets,
      columns: 4,
      spacing: 'normal'
    };
    
    const updatedLayouts = layouts.map(layout =>
      layout.id === currentLayout?.id ? defaultLayout : layout
    );
    
    setCurrentLayout(defaultLayout);
    saveLayouts(updatedLayouts);
    
    toast({
      title: "Layout restaurado",
      description: "O layout foi restaurado para o padrão.",
    });
  };

  if (!currentLayout) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-light flex items-center gap-2">
            <Grid size={24} />
            Personalização do Dashboard
          </h2>
          <p className="text-secondary-light">Configure widgets e layout do painel principal</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-mode" className="text-sm">Modo Visualização</Label>
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={setPreviewMode}
            />
          </div>
          
          <Button onClick={resetToDefault} variant="outline" size="sm">
            <RotateCcw size={16} className="mr-2" />
            Restaurar Padrão
          </Button>
          
          <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} className="mr-2" />
                Adicionar Widget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Widget</DialogTitle>
              </DialogHeader>
              <AddWidgetForm onAdd={addWidget} onCancel={() => setShowAddWidget(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Layout Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Configurações do Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Colunas</Label>
              <Select
                value={currentLayout.columns.toString()}
                onValueChange={(value) => {
                  const updatedLayout = { ...currentLayout, columns: parseInt(value) };
                  setCurrentLayout(updatedLayout);
                  const updatedLayouts = layouts.map(layout =>
                    layout.id === currentLayout.id ? updatedLayout : layout
                  );
                  saveLayouts(updatedLayouts);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Colunas</SelectItem>
                  <SelectItem value="3">3 Colunas</SelectItem>
                  <SelectItem value="4">4 Colunas</SelectItem>
                  <SelectItem value="6">6 Colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Espaçamento</Label>
              <Select
                value={currentLayout.spacing}
                onValueChange={(value: 'compact' | 'normal' | 'spacious') => {
                  const updatedLayout = { ...currentLayout, spacing: value };
                  setCurrentLayout(updatedLayout);
                  const updatedLayouts = layouts.map(layout =>
                    layout.id === currentLayout.id ? updatedLayout : layout
                  );
                  saveLayouts(updatedLayouts);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Espaçoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Widgets Visíveis</Label>
              <div className="text-sm text-secondary-light">
                {currentLayout.widgets.filter(w => w.visible).length} de {currentLayout.widgets.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widgets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Widgets Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentLayout.widgets.map((widget) => {
              const IconComponent = widgetIcons[widget.type];
              
              return (
                <div
                  key={widget.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    widget.visible ? 'bg-accent/50 border-border' : 'bg-muted/30 border-muted'
                  } ${previewMode ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${widget.visible ? 'bg-primary/10' : 'bg-muted'}`}>
                      <IconComponent size={20} className={widget.visible ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-primary-light">{widget.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-secondary-light">
                        <Badge variant="outline" className="text-xs">
                          {widget.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {widget.size}
                        </Badge>
                        {widget.config.colorScheme && (
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${
                              colorSchemes.find(c => c.value === widget.config.colorScheme)?.color || 'bg-gray-500'
                            }`}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      disabled={previewMode}
                    >
                      {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWidget(widget)}
                      disabled={previewMode}
                    >
                      <Edit size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWidget(widget.id)}
                      disabled={previewMode}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={previewMode}
                      className="cursor-move"
                    >
                      <Move size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Preview */}
      {previewMode && currentLayout && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Prévia do Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardPreview layout={currentLayout} isPreview={true} />
          </CardContent>
        </Card>
      )}

      {/* Widget Editor Modal */}
      {editingWidget && (
        <Dialog open={!!editingWidget} onOpenChange={() => setEditingWidget(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Widget: {editingWidget.title}</DialogTitle>
            </DialogHeader>
            <WidgetEditor 
              widget={editingWidget} 
              onSave={updateWidget} 
              onCancel={() => setEditingWidget(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Widget Editor Component
function WidgetEditor({ widget, onSave, onCancel }: {
  widget: Widget;
  onSave: (widget: Widget) => void;
  onCancel: () => void;
}) {
  const [editedWidget, setEditedWidget] = useState<Widget>(widget);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Título</Label>
          <Input
            value={editedWidget.title}
            onChange={(e) => setEditedWidget({ ...editedWidget, title: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Tamanho</Label>
          <Select
            value={editedWidget.size}
            onValueChange={(value: 'small' | 'medium' | 'large' | 'full') => 
              setEditedWidget({ ...editedWidget, size: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="full">Largura Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Esquema de Cores</Label>
          <Select
            value={editedWidget.config.colorScheme || 'blue'}
            onValueChange={(value) => 
              setEditedWidget({ 
                ...editedWidget, 
                config: { ...editedWidget.config, colorScheme: value }
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colorSchemes.map((scheme) => (
                <SelectItem key={scheme.value} value={scheme.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${scheme.color}`}></div>
                    {scheme.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Intervalo de Atualização (segundos)</Label>
          <Input
            type="number"
            value={editedWidget.config.refreshInterval || 30}
            onChange={(e) => 
              setEditedWidget({ 
                ...editedWidget, 
                config: { 
                  ...editedWidget.config, 
                  refreshInterval: parseInt(e.target.value) || 30 
                }
              })
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-trends"
            checked={editedWidget.config.showTrends || false}
            onCheckedChange={(checked) =>
              setEditedWidget({
                ...editedWidget,
                config: { ...editedWidget.config, showTrends: checked }
              })
            }
          />
          <Label htmlFor="show-trends">Mostrar Tendências</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(editedWidget)}>
          <Save size={16} className="mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}

// Add Widget Form Component
function AddWidgetForm({ onAdd, onCancel }: {
  onAdd: (widget: Omit<Widget, 'id'>) => void;
  onCancel: () => void;
}) {
  const [newWidget, setNewWidget] = useState<Omit<Widget, 'id'>>({
    title: '',
    type: 'stat',
    size: 'medium',
    position: { x: 0, y: 0 },
    visible: true,
    config: {
      dataSource: '/api/attendants',
      refreshInterval: 30,
      showTrends: false,
      colorScheme: 'blue'
    }
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Título</Label>
          <Input
            value={newWidget.title}
            onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
            placeholder="Nome do widget"
          />
        </div>
        
        <div>
          <Label>Tipo</Label>
          <Select
            value={newWidget.type}
            onValueChange={(value: Widget['type']) => 
              setNewWidget({ ...newWidget, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stat">Estatística</SelectItem>
              <SelectItem value="chart">Gráfico</SelectItem>
              <SelectItem value="list">Lista</SelectItem>
              <SelectItem value="progress">Progresso</SelectItem>
              <SelectItem value="calendar">Calendário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Tamanho</Label>
          <Select
            value={newWidget.size}
            onValueChange={(value: Widget['size']) => 
              setNewWidget({ ...newWidget, size: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="full">Largura Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Fonte de Dados</Label>
          <Select
            value={newWidget.config.dataSource || '/api/attendants'}
            onValueChange={(value) => 
              setNewWidget({ 
                ...newWidget, 
                config: { ...newWidget.config, dataSource: value }
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/api/attendants">Atendentes</SelectItem>
              <SelectItem value="/api/sales">Vendas</SelectItem>
              <SelectItem value="/api/goals">Metas</SelectItem>
              <SelectItem value="/api/achievements">Conquistas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={() => onAdd(newWidget)}
          disabled={!newWidget.title.trim()}
        >
          <Plus size={16} className="mr-2" />
          Adicionar Widget
        </Button>
      </div>
    </div>
  );
}