import { useStatistics } from '../hooks/useStatistics';

interface StatisticsProps {
  onFilterByStatus: (status: string | null) => void;
  selectedStatus: string | null;
}

function Statistics({ onFilterByStatus, selectedStatus }: StatisticsProps) {
  const { data: stats = { total: 0, byStatus: {} }, isLoading } = useStatistics();

  const statusLabels: Record<string, string> = {
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    applied: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
    interviewing: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
    offer: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
    withdrawn: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-500' },
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg min-w-[120px] text-center">
          <div className="text-3xl font-bold mb-2">-</div>
          <div className="text-sm uppercase tracking-wide opacity-90">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg min-w-[120px] text-center cursor-default">
        <div className="text-3xl font-bold mb-2">{stats.total}</div>
        <div className="text-sm uppercase tracking-wide opacity-90">Total Applications</div>
      </div>
      {Object.entries(stats.byStatus).map(([status, count]) => {
        const colors = statusColors[status] || statusColors.applied;
        const isSelected = selectedStatus === status;
        return (
          <div
            key={status}
            className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 shadow-md min-w-[120px] text-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
              isSelected ? 'ring-2 ring-offset-2 ring-purple-500 bg-opacity-100' : 'bg-opacity-50'
            }`}
            onClick={() => onFilterByStatus(isSelected ? null : status)}
          >
            <div className={`text-3xl font-bold mb-2 ${colors.text}`}>
              {count as number}
            </div>
            <div className="text-sm uppercase tracking-wide text-gray-700 font-semibold">
              {statusLabels[status]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Statistics;
