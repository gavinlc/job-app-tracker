import { JobApplication } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ApplicationListProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
}

function ApplicationList({ applications, onEdit, onDelete }: ApplicationListProps) {
  const statusLabels: Record<string, string> = {
    interested: 'Interested',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    interested: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500' },
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
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-base">No applications found. Click "Add Application" to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {applications.map((app) => {
            const statusStyle = statusStyles[app.status] || statusStyles.interested;
            return (
              <Card 
                key={app.id} 
                className="border-2 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-0.5">{app.position}</h3>
                      <h4 className="text-base text-muted-foreground font-medium">{app.company}</h4>
                    </div>
                    <Badge
                      className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border-2 whitespace-nowrap`}
                    >
                      {statusLabels[app.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-3 p-3 bg-muted rounded-lg text-sm">
                    {app.location && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span>📍</span>
                        <span>{app.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>📅</span>
                      <span>Applied: {formatDate(app.dateApplied)}</span>
                    </div>
                    {app.salary && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span>💰</span>
                        <span>{app.salary}</span>
                      </div>
                    )}
                    {app.contactName && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span>👤</span>
                        <span>{app.contactName}</span>
                        {app.contactEmail && (
                          <a 
                            href={`mailto:${app.contactEmail}`} 
                            className="text-primary hover:underline ml-1"
                          >
                            {app.contactEmail}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {app.notes && (
                    <div className="mb-3 p-3 bg-muted rounded-lg leading-relaxed text-sm">
                      <strong>Notes:</strong> {app.notes}
                    </div>
                  )}

                  {app.jobUrl && (
                    <div className="mb-3 pt-3 border-t">
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline text-sm"
                      >
                        View Job Posting →
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button 
                      onClick={() => onEdit(app)}
                      variant="default"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => app.id && onDelete(app.id)}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ApplicationList;
