import { JobApplication } from '../types';

interface ApplicationListProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
}

function ApplicationList({ applications, onEdit, onDelete }: ApplicationListProps) {
  const statusLabels: Record<string, string> = {
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    applied: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
    interviewing: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
    offer: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
    withdrawn: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-500' },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-md">
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No applications found. Click "Add Application" to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex flex-col gap-6">
        {applications.map((app) => {
          const statusStyle = statusStyles[app.status] || statusStyles.applied;
          return (
            <div 
              key={app.id} 
              className="border-2 border-gray-200 rounded-xl p-6 transition-all duration-200 bg-gray-50 hover:border-purple-500 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{app.position}</h3>
                  <h4 className="text-lg text-gray-600 font-medium">{app.company}</h4>
                </div>
                <span
                  className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap`}
                >
                  {statusLabels[app.status]}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg">
                {app.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-lg">📍</span>
                    <span>{app.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-lg">📅</span>
                  <span>Applied: {formatDate(app.dateApplied)}</span>
                </div>
                {app.salary && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-lg">💰</span>
                    <span>{app.salary}</span>
                  </div>
                )}
                {app.contactName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-lg">👤</span>
                    <span>{app.contactName}</span>
                    {app.contactEmail && (
                      <a 
                        href={`mailto:${app.contactEmail}`} 
                        className="text-purple-600 hover:text-purple-700 hover:underline ml-1"
                      >
                        {app.contactEmail}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {app.notes && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg text-gray-700 leading-relaxed">
                  <strong className="text-gray-800">Notes:</strong> {app.notes}
                </div>
              )}

              {app.jobUrl && (
                <div className="mb-4 pt-4 border-t border-gray-200">
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 font-semibold hover:text-purple-700 hover:underline"
                  >
                    View Job Posting →
                  </a>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => onEdit(app)} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => app.id && onDelete(app.id)} 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ApplicationList;
