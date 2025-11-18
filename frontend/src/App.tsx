import { useState } from 'react';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';
import SearchBar from './components/SearchBar';
import Statistics from './components/Statistics';
import { useApplications, useSearchApplications, useCreateApplication, useUpdateApplication, useDeleteApplication } from './hooks/useApplications';
import { JobApplication } from './types';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!window.confirm('Are you sure you want to delete this application?')) {
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

  const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700">
      <header className="bg-white/95 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Job Application Tracker</h1>
          <p className="text-lg text-gray-600">Track and manage your job applications</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Statistics onFilterByStatus={handleFilterByStatus} selectedStatus={filterStatus} />
        
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <SearchBar onSearch={handleSearch} />
          <button 
            onClick={handleAddApplication} 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            + Add Application
          </button>
          {filterStatus && (
            <button 
              onClick={() => handleFilterByStatus(null)} 
              className="px-6 py-3 bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-500 text-white px-4 py-3 rounded-lg text-center">
            {errorMessage}
          </div>
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
          <div className="text-center py-8 text-white text-xl">Loading...</div>
        )}

        <ApplicationList
          applications={displayApplications}
          onEdit={handleEditApplication}
          onDelete={handleDeleteApplication}
        />
      </main>
    </div>
  );
}

export default App;
