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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2 } from "lucide-react";

interface TableItem {
  id: string | number;
  [key: string]: any;
}

interface SortableRowProps {
  item: TableItem;
  columns: { key: string; label: string; render?: (value: any, item: TableItem) => React.ReactNode }[];
  onEdit?: (item: TableItem) => void;
  onDelete?: (id: string | number) => void;
}

function SortableRow({ item, columns, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={`${isDragging ? 'shadow-lg' : 'hover:bg-muted/5'} transition-all`}
    >
      <TableCell className="w-12">
        <button
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-md bg-accent/30 hover:bg-accent/60 text-secondary-light hover:text-primary-light transition-all duration-200 border border-border/20 hover:border-border/40"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
      </TableCell>
      
      {columns.map((column) => (
        <TableCell key={column.key} className="text-primary-light">
          {column.render ? column.render(item[column.key], item) : item[column.key]}
        </TableCell>
      ))}
      
      <TableCell className="w-24">
        <div className="flex gap-1">
          {onEdit && (
            <Button
              onClick={() => onEdit(item)}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-border text-secondary-light hover:text-primary-light"
            >
              <Edit size={14} />
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(item.id)}
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface DragDropTableProps {
  items: TableItem[];
  columns: { key: string; label: string; render?: (value: any, item: TableItem) => React.ReactNode }[];
  onReorder: (newOrder: TableItem[]) => void;
  onEdit?: (item: TableItem) => void;
  onDelete?: (id: string | number) => void;
}

export default function DragDropTable({ 
  items, 
  columns, 
  onReorder, 
  onEdit, 
  onDelete 
}: DragDropTableProps) {
  const [tableItems, setTableItems] = useState(items);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tableItems.findIndex((item) => item.id.toString() === active.id);
      const newIndex = tableItems.findIndex((item) => item.id.toString() === over?.id);
      
      const newOrder = arrayMove(tableItems, oldIndex, newIndex);
      setTableItems(newOrder);
      onReorder(newOrder);
    }
  }

  // Update items when props change
  useEffect(() => {
    setTableItems(items);
  }, [items]);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-12"></TableHead>
              {columns.map((column) => (
                <TableHead key={column.key} className="text-secondary-light">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-24 text-secondary-light">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext 
              items={tableItems.map(item => item.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {tableItems.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  columns={columns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
      
      {tableItems.length === 0 && (
        <div className="text-center py-8 text-secondary-light">
          <p>Nenhum item para exibir</p>
        </div>
      )}
    </DndContext>
  );
}