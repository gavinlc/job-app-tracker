import ApplicationList from './ApplicationList';
import ApplicationTable from './ApplicationTable';
import { KanbanBoard } from './KanbanBoard';
import { JobApplication } from '../types';

type ViewMode = 'list' | 'kanban' | 'table';

interface ViewRendererProps {
  viewMode: ViewMode;
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onToggleStar: (id: number) => void;
  onStatusChange: (id: number, newStatus: JobApplication['status']) => void;
}

export function ViewRenderer({
  viewMode,
  applications,
  onEdit,
  onDelete,
  onToggleStar,
  onStatusChange,
}: ViewRendererProps) {
  const sectionClass = viewMode === 'kanban' ? 'w-full' : 'max-w-7xl mx-auto';

  return (
    <section className={sectionClass}>
      {viewMode === 'list' ? (
        <ApplicationList
          applications={applications}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
        />
      ) : viewMode === 'table' ? (
        <ApplicationTable
          applications={applications}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
        />
      ) : (
        <KanbanBoard
          applications={applications}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onToggleStar={onToggleStar}
        />
      )}
    </section>
  );
}

