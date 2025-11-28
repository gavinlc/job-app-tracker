import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import ApplicationForm from './components/ApplicationForm';
import Statistics from './components/Statistics';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ViewRenderer } from './components/ViewRenderer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useApplications, useSearchApplications, useCreateApplication, useUpdateApplication, useDeleteApplication, useToggleStarApplication } from './hooks/useApplications';
import { useAuth } from './hooks/useAuth';
import { JobApplication } from './types';
import { Alert, AlertDescription } from './components/ui/alert';

type ViewMode = 'list' | 'kanban' | 'table';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/sign-in' });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Get user ID from user object
  const userId = user?.id || null;

  // Use search query if provided, otherwise use filtered applications
  const shouldSearch = searchQuery.trim().length > 0;
  const { data: searchResults } = useSearchApplications(searchQuery, shouldSearch, filterStarred, filterActive, userId);
  const { data: applications = [], isLoading, error } = useApplications(userId, shouldSearch ? null : filterStatus, filterStarred, filterActive);

  // Determine which data to display
  const displayApplications = shouldSearch ? (searchResults || []) : applications;

  const createMutation = useCreateApplication(userId);
  const updateMutation = useUpdateApplication(userId);
  const deleteMutation = useDeleteApplication(userId);
  const toggleStarMutation = useToggleStarApplication(userId);

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

  const handleToggleStarredFilter = () => {
    setFilterStarred(!filterStarred);
  };

  const handleToggleActiveFilter = () => {
    setFilterActive(!filterActive);
  };

  const handleClearFilters = () => {
    setFilterStatus(null);
    setFilterStarred(false);
    setFilterActive(false);
    setSearchQuery('');
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

  const handleToggleStar = async (id: number) => {
    try {
      await toggleStarMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications';

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Don't render app content if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/sign-in' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" suppressHydrationWarning>
      <Header user={user} onSignOut={handleSignOut} />

      <main className="p-4">
        <section className="max-w-7xl mx-auto flex flex-col gap-4">
          <Statistics onFilterByStatus={handleFilterByStatus} selectedStatus={filterStatus} userId={userId} />
          <Toolbar
            viewMode={viewMode}
            onViewModeChange={(value) => setViewMode(value as ViewMode)}
            onSearch={handleSearch}
            onAddApplication={handleAddApplication}
            filterStarred={filterStarred}
            filterActive={filterActive}
            filterStatus={filterStatus}
            onToggleStarredFilter={handleToggleStarredFilter}
            onToggleActiveFilter={handleToggleActiveFilter}
            onClearFilters={handleClearFilters}
          />
        </section>

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

        {isLoading && <LoadingSpinner />}
        <ViewRenderer
          viewMode={viewMode}
          applications={displayApplications}
          onEdit={handleEditApplication}
          onDelete={handleDeleteApplication}
          onToggleStar={handleToggleStar}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
}

export default App;
