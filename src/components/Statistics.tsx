import { useStatistics } from '../hooks/useStatistics';
import { Card, CardContent } from './ui/card';

interface StatisticsProps {
  onFilterByStatus: (status: string | null) => void;
  selectedStatus: string | null;
}

function Statistics({ onFilterByStatus, selectedStatus }: StatisticsProps) {
  const { data: stats = { total: 0, byStatus: {} }, isLoading } = useStatistics();

  const statusLabels: Record<string, string> = {
    interested: 'Interested',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    interested: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500' },
    applied: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
    interviewing: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
    offer: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
    withdrawn: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-500' },
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3 mb-4">
        <Card className="bg-primary text-primary-foreground min-w-[100px]">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold mb-1">-</div>
            <div className="text-xs uppercase tracking-wide opacity-90">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <Card className="bg-primary text-primary-foreground min-w-[100px] cursor-default">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold mb-1">{stats.total}</div>
          <div className="text-xs uppercase tracking-wide opacity-90">Total</div>
        </CardContent>
      </Card>
      {Object.entries(stats.byStatus).map(([status, count]) => {
        const colors = statusColors[status] || statusColors.interested;
        const isSelected = selectedStatus === status;
        return (
          <Card
            key={status}
            className={`${colors.bg} ${colors.border} border-2 min-w-[100px] cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
              isSelected ? 'ring-2 ring-offset-2 ring-primary bg-opacity-100' : 'bg-opacity-50'
            }`}
            onClick={() => onFilterByStatus(isSelected ? null : status)}
          >
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${colors.text}`}>
                {count as number}
              </div>
              <div className="text-xs uppercase tracking-wide font-semibold">
                {statusLabels[status]}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default Statistics;
