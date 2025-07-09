import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Edit } from "lucide-react";
import type { Attendant } from "@shared/schema";

interface SortableItemProps {
  id: string;
  attendant: Attendant;
  onEdit?: (attendant: Attendant) => void;
  onDelete?: (id: number) => void;
}

function SortableItem({ id, attendant, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card className={`bg-card border-border ${isDragging ? 'shadow-lg' : 'hover:shadow-md'} transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab active:cursor-grabbing text-secondary-light hover:text-primary-light p-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={20} />
            </button>
            
            <img 
              src={attendant.imageUrl} 
              alt={attendant.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h4 className="text-primary-light font-medium">{attendant.name}</h4>
              <p className="text-secondary-light text-sm">R$ {attendant.earnings}</p>
            </div>
            
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  onClick={() => onEdit(attendant)}
                  variant="outline"
                  size="sm"
                  className="border-border text-secondary-light hover:text-primary-light"
                >
                  <Edit size={16} />
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={() => onDelete(attendant.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DragDropManagerProps {
  attendants: Attendant[];
  onReorder: (newOrder: Attendant[]) => void;
  onEdit?: (attendant: Attendant) => void;
  onDelete?: (id: number) => void;
}

export default function DragDropManager({ 
  attendants, 
  onReorder, 
  onEdit, 
  onDelete 
}: DragDropManagerProps) {
  const [items, setItems] = useState(attendants);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id.toString() === active.id);
      const newIndex = items.findIndex((item) => item.id.toString() === over?.id);
      
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);
      onReorder(newOrder);
    }
  }

  // Update items when attendants prop changes
  useEffect(() => {
    setItems(attendants);
  }, [attendants]);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(item => item.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((attendant) => (
            <SortableItem
              key={attendant.id}
              id={attendant.id.toString()}
              attendant={attendant}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}