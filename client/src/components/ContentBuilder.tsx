import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, Trash2, BarChart3, Users, Target, Trophy } from "lucide-react";

interface ContentWidget {
  id: string;
  type: 'chart' | 'stats' | 'list' | 'card';
  title: string;
  config: {
    dataSource?: string;
    chartType?: string;
    showLabels?: boolean;
    columns?: number;
  };
}

interface SortableWidgetProps {
  widget: ContentWidget;
  onUpdate: (widget: ContentWidget) => void;
  onDelete: (id: string) => void;
}

function SortableWidget({ widget, onUpdate, onDelete }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = () => {
    switch (widget.type) {
      case 'chart': return <BarChart3 size={20} />;
      case 'stats': return <Target size={20} />;
      case 'list': return <Users size={20} />;
      case 'card': return <Trophy size={20} />;
      default: return <BarChart3 size={20} />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className={`bg-card border-border ${isDragging ? 'shadow-lg' : 'hover:shadow-md'} transition-all`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="cursor-grab active:cursor-grabbing p-2 rounded-lg bg-accent/50 hover:bg-accent text-secondary-light hover:text-primary-light transition-all duration-200 border border-border/30 hover:border-border/60 shadow-sm hover:shadow-md"
                {...attributes}
                {...listeners}
              >
                <GripVertical size={18} />
              </button>
              <div className="text-primary-light">{getIcon()}</div>
              <CardTitle className="text-lg text-primary-light">{widget.title}</CardTitle>
            </div>
            <Button
              onClick={() => onDelete(widget.id)}
              variant="destructive"
              size="sm"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-secondary-light">Título</Label>
              <Input
                value={widget.title}
                onChange={(e) => onUpdate({ ...widget, title: e.target.value })}
                className="bg-input border-border text-primary-light"
              />
            </div>
            <div>
              <Label className="text-secondary-light">Tipo</Label>
              <Select 
                value={widget.type} 
                onValueChange={(value) => onUpdate({ ...widget, type: value as ContentWidget['type'] })}
              >
                <SelectTrigger className="bg-input border-border text-primary-light">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chart">Gráfico</SelectItem>
                  <SelectItem value="stats">Estatísticas</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {widget.type === 'chart' && (
              <div>
                <Label className="text-secondary-light">Tipo de Gráfico</Label>
                <Select 
                  value={widget.config.chartType || 'bar'} 
                  onValueChange={(value) => onUpdate({ 
                    ...widget, 
                    config: { ...widget.config, chartType: value }
                  })}
                >
                  <SelectTrigger className="bg-input border-border text-primary-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="line">Linha</SelectItem>
                    <SelectItem value="pie">Pizza</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label className="text-secondary-light">Fonte de Dados</Label>
              <Select 
                value={widget.config.dataSource || 'sales'} 
                onValueChange={(value) => onUpdate({ 
                  ...widget, 
                  config: { ...widget.config, dataSource: value }
                })}
              >
                <SelectTrigger className="bg-input border-border text-primary-light">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="attendants">Atendentes</SelectItem>
                  <SelectItem value="goals">Metas</SelectItem>
                  <SelectItem value="achievements">Conquistas</SelectItem>
                  <SelectItem value="leaderboard">Ranking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ContentBuilderProps {
  onSave: (widgets: ContentWidget[]) => void;
}

export default function ContentBuilder({ onSave }: ContentBuilderProps) {
  const [widgets, setWidgets] = useState<ContentWidget[]>([
    {
      id: '1',
      type: 'chart',
      title: 'Vendas por Atendente',
      config: {
        dataSource: 'sales',
        chartType: 'bar',
        showLabels: true
      }
    },
    {
      id: '2',
      type: 'stats',
      title: 'Estatísticas Gerais',
      config: {
        dataSource: 'attendants',
        columns: 3
      }
    }
  ]);
  
  const [activeWidget, setActiveWidget] = useState<ContentWidget | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const widget = widgets.find(w => w.id === active.id);
    setActiveWidget(widget || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveWidget(null);

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((item) => item.id === active.id);
      const newIndex = widgets.findIndex((item) => item.id === over?.id);
      
      const newOrder = arrayMove(widgets, oldIndex, newIndex);
      setWidgets(newOrder);
    }
  }

  const addWidget = () => {
    const newWidget: ContentWidget = {
      id: Date.now().toString(),
      type: 'chart',
      title: 'Novo Widget',
      config: {
        dataSource: 'sales',
        chartType: 'bar'
      }
    };
    setWidgets([...widgets, newWidget]);
  };

  const updateWidget = (updatedWidget: ContentWidget) => {
    setWidgets(widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w));
  };

  const deleteWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleSave = () => {
    onSave(widgets);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-primary-light">Construtor de Conteúdo</h3>
          <p className="text-secondary-light">Arraste e reorganize os widgets do painel</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addWidget} className="bg-success text-primary-light hover:bg-success-dark">
            <Plus size={16} className="mr-2" />
            Adicionar Widget
          </Button>
          <Button onClick={handleSave} variant="outline" className="border-border text-secondary-light">
            Salvar Layout
          </Button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={widgets.map(widget => widget.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                onUpdate={updateWidget}
                onDelete={deleteWidget}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeWidget ? (
            <Card className="bg-card border-border shadow-lg opacity-95">
              <CardHeader>
                <CardTitle className="text-primary-light flex items-center gap-2">
                  <GripVertical size={20} />
                  {activeWidget.title}
                </CardTitle>
              </CardHeader>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-secondary-light mb-4">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum widget configurado</p>
            <p className="text-sm">Clique em "Adicionar Widget" para começar</p>
          </div>
        </div>
      )}
    </div>
  );
}