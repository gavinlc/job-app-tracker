import { useState, useEffect } from 'react';
import { JobApplication } from '../types';

interface ApplicationFormProps {
  application: JobApplication | null;
  onSave: (application: JobApplication) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ApplicationForm({ application, onSave, onCancel, isLoading = false }: ApplicationFormProps) {
  const [formData, setFormData] = useState<JobApplication>({
    company: '',
    position: '',
    location: '',
    jobUrl: '',
    status: 'applied',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '',
    salary: '',
    contactName: '',
    contactEmail: '',
  });

  useEffect(() => {
    if (application) {
      setFormData(application);
    }
  }, [application]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {application ? 'Edit Application' : 'Add New Application'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="company" className="font-semibold text-gray-700 text-sm">
                Company *
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="position" className="font-semibold text-gray-700 text-sm">
                Position *
              </label>
              <input
                id="position"
                name="position"
                type="text"
                value={formData.position}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="location" className="font-semibold text-gray-700 text-sm">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Remote, New York, NY"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="dateApplied" className="font-semibold text-gray-700 text-sm">
                Date Applied *
              </label>
              <input
                id="dateApplied"
                name="dateApplied"
                type="date"
                value={formData.dateApplied}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="font-semibold text-gray-700 text-sm">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors bg-white"
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="salary" className="font-semibold text-gray-700 text-sm">
                Salary
              </label>
              <input
                id="salary"
                name="salary"
                type="text"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $100k - $120k"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="jobUrl" className="font-semibold text-gray-700 text-sm">
              Job Posting URL
            </label>
            <input
              id="jobUrl"
              name="jobUrl"
              type="url"
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="contactName" className="font-semibold text-gray-700 text-sm">
                Contact Name
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={formData.contactName}
                onChange={handleChange}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contactEmail" className="font-semibold text-gray-700 text-sm">
                Contact Email
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="notes" className="font-semibold text-gray-700 text-sm">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Additional notes, interview dates, follow-ups, etc."
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors resize-y"
            />
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Saving...' : application ? 'Update' : 'Add'} Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicationForm;
