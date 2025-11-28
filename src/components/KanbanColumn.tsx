import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { JobApplication } from '../types';
import { KanbanCard } from './KanbanCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface KanbanColumnProps {
  id: string;
  title: string;
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onToggleStar?: (id: number) => void;
}

export function KanbanColumn({ id, title, applications, onEdit, onDelete, onToggleStar }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const applicationIds = useMemo(
    () => applications.map((app) => app.id!).filter((id): id is number => id !== undefined),
    [applications]
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-0 ${isOver ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}
    >
      <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {applications.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <SortableContext items={applicationIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No applications
              </div>
            ) : (
              applications.map((app) => (
                <KanbanCard
                  key={app.id}
                  application={app}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStar={onToggleStar}
                />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
      </Card>
    </div>
  );
}

