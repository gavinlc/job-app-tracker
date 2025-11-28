import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { JobApplication } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Card } from './ui/card';

interface KanbanBoardProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: JobApplication['status']) => void;
  onToggleStar?: (id: number) => void;
}

const statuses: JobApplication['status'][] = ['interested', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'];

const statusLabels: Record<string, string> = {
  interested: 'Interested',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export function KanbanBoard({ applications, onEdit, onDelete, onStatusChange, onToggleStar }: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const applicationsByStatus = useMemo(() => {
    const grouped: Record<string, JobApplication[]> = {
      interested: [],
      applied: [],
      interviewing: [],
      offer: [],
      rejected: [],
      withdrawn: [],
    };

    applications.forEach((app) => {
      if (app.status && grouped[app.status]) {
        grouped[app.status].push(app);
      }
    });

    return grouped;
  }, [applications]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    // Find the application being dragged
    const application = applications.find((app) => app.id === activeId);
    if (!application) return;

    // Check if dropped on a status column (string ID)
    if (typeof overId === 'string' && statuses.includes(overId as JobApplication['status'])) {
      const newStatus = overId as JobApplication['status'];
      if (application.status !== newStatus) {
        onStatusChange(activeId, newStatus);
      }
      return;
    }

    // Check if dropped on another card (number ID)
    if (typeof overId === 'number') {
      const overApplication = applications.find((app) => app.id === overId);
      if (overApplication && application.status !== overApplication.status) {
        // Dropped on a card in a different column - move to that column's status
        onStatusChange(activeId, overApplication.status);
      }
      // If same column, we could implement reordering here if needed
    }
  };

  const activeApplication = activeId ? applications.find((app) => app.id === activeId) : null;

  if (applications.length === 0) {
    return (
      <Card>
        <div className="p-4">
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-base">No applications found. Click "Add Application" to get started!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 w-full">
        {statuses.map((status) => {
          const columnApps = applicationsByStatus[status] || [];
          return (
            <KanbanColumn
              key={status}
              id={status}
              title={statusLabels[status]}
              applications={columnApps}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStar={onToggleStar}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeApplication ? (
          <div className="opacity-90 rotate-2">
            <KanbanCard application={activeApplication} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

