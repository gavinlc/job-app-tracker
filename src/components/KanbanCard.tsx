import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobApplication } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { GripVertical } from 'lucide-react';

interface KanbanCardProps {
  application: JobApplication;
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: number) => void;
  isDragging?: boolean;
}

export function KanbanCard({ application, onEdit, onDelete, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: application.id!,
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isSortableDragging ? 'shadow-lg' : ''
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-0.5 truncate">{application.position}</h3>
            <h4 className="text-xs text-muted-foreground truncate">{application.company}</h4>
          </div>
        </div>

        {application.location && (
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <span>📍</span>
            <span className="truncate">{application.location}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground mb-2">
          📅 {formatDate(application.dateApplied)}
        </div>

        {application.salary && (
          <div className="text-xs text-muted-foreground mb-2">
            💰 {application.salary}
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="flex gap-1 mt-2 pt-2 border-t">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 flex-1"
                onClick={() => onEdit(application)}
              >
                Edit
              </Button>
            )}
            {onDelete && application.id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                onClick={() => onDelete(application.id!)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

