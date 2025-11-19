import { useState } from 'react';
import ApplicationList from './components/ApplicationList';
import ApplicationTable from './components/ApplicationTable';
import { KanbanBoard } from './components/KanbanBoard';
import ApplicationForm from './components/ApplicationForm';
import SearchBar from './components/SearchBar';
import Statistics from './components/Statistics';
import { useApplications, useSearchApplications, useCreateApplication, useUpdateApplication, useDeleteApplication } from './hooks/useApplications';
import { JobApplication } from './types';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { LayoutList, LayoutGrid, Table, Plus, X } from 'lucide-react';

type ViewMode = 'list' | 'kanban' | 'table';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Use search query if provided, otherwise use filtered applications
  const shouldSearch = searchQuery.trim().length > 0;
  const { data: searchResults } = useSearchApplications(searchQuery, shouldSearch);
  const { data: applications = [], isLoading, error } = useApplications(shouldSearch ? null : filterStatus);

  // Determine which data to display
  const displayApplications = shouldSearch ? (searchResults || []) : applications;

  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddApplication = () => {
    setEditingApplication(null);
    setShowForm(true);
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setShowForm(true);
  };

  const handleSaveApplication = async (application: JobApplication) => {
    try {
      if (application.id) {
        await updateMutation.mutateAsync({ id: application.id, application });
      } else {
        await createMutation.mutateAsync(application);
      }
      
      setShowForm(false);
      setEditingApplication(null);
    } catch (err) {
      console.error('Failed to save application:', err);
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const handleFilterByStatus = (status: string | null) => {
    setFilterStatus(status);
    setSearchQuery(''); // Clear search when filtering
  };

  const handleStatusChange = async (id: number, newStatus: JobApplication['status']) => {
    try {
      const application = displayApplications.find((app) => app.id === id);
      if (!application) return;

      await updateMutation.mutateAsync({
        id,
        application: { ...application, status: newStatus },
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" suppressHydrationWarning>
      <header className="bg-white/95 backdrop-blur-sm shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Job Application Tracker</h1>
          <p className="text-sm text-slate-600">Track and manage your job applications</p>
        </div>
      </header>

      <main className={`${viewMode === 'kanban' ? 'w-full px-4' : 'max-w-7xl mx-auto px-4'} py-4`}>
        <Statistics onFilterByStatus={handleFilterByStatus} selectedStatus={filterStatus} />
        
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <SearchBar onSearch={handleSearch} />
          <div className="flex gap-2 ml-auto">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <LayoutList className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex items-center gap-2"
            >
              <Table className="h-4 w-4" />
              Table
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </Button>
          </div>
          <Button 
            onClick={handleAddApplication}
            className="whitespace-nowrap flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
          {filterStatus && (
            <Button 
              onClick={() => handleFilterByStatus(null)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filter
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {showForm && (
          <ApplicationForm
            application={editingApplication}
            onSave={handleSaveApplication}
            onCancel={() => {
              setShowForm(false);
              setEditingApplication(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {isLoading && (
          <div className="text-center py-4 text-foreground">Loading...</div>
        )}

        {viewMode === 'list' ? (
          <ApplicationList
            applications={displayApplications}
            onEdit={handleEditApplication}
            onDelete={handleDeleteApplication}
          />
        ) : viewMode === 'table' ? (
          <ApplicationTable
            applications={displayApplications}
            onEdit={handleEditApplication}
            onDelete={handleDeleteApplication}
          />
        ) : (
          <KanbanBoard
            applications={displayApplications}
            onEdit={handleEditApplication}
            onDelete={handleDeleteApplication}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  );
}

export default App;
