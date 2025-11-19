import { JobApplication } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface ApplicationTableProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
}

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

function ApplicationTable({ applications, onEdit, onDelete }: ApplicationTableProps) {
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
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const statusStyle = statusStyles[app.status] || statusStyles.interested;
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium">{app.company}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{app.position}</div>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 block"
                      >
                        View Job →
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.location || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border-2 whitespace-nowrap`}
                    >
                      {statusLabels[app.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(app.dateApplied)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {app.salary || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {app.contactName ? (
                      <div>
                        <div>{app.contactName}</div>
                        {app.contactEmail && (
                          <a 
                            href={`mailto:${app.contactEmail}`}
                            className="text-primary hover:underline text-xs"
                          >
                            {app.contactEmail}
                          </a>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => onEdit(app)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={() => app.id && onDelete(app.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ApplicationTable;

