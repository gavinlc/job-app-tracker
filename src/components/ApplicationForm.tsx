import { useState, useEffect } from 'react';
import { JobApplication } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { parseJobPostingFn } from '../lib/server';
import { Alert, AlertDescription } from './ui/alert';

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
    status: 'interested',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: '',
    salary: '',
    contactName: '',
    contactEmail: '',
  });
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

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

  const handleFetchFromUrl = async () => {
    const url = formData.jobUrl?.trim();
    if (!url || !url.startsWith('http')) {
      setParseError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const parsed = await parseJobPostingFn({ data: { url } });
      
      // Merge parsed data with existing form data (don't overwrite if user already filled something)
      setFormData((prev) => ({
        ...prev,
        ...parsed,
        // Only update fields that are empty or were just parsed
        company: prev.company || parsed.company || '',
        position: prev.position || parsed.position || '',
        location: prev.location || parsed.location || '',
        salary: prev.salary || parsed.salary || '',
        notes: prev.notes || parsed.notes || '',
        jobUrl: url, // Always use the URL that was fetched
      }));
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse job posting');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {application ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
        </DialogHeader>
        {parseError && (
          <Alert variant="destructive">
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jobUrl">
              Job Posting URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="jobUrl"
                name="jobUrl"
                type="url"
                value={formData.jobUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleFetchFromUrl}
                disabled={isParsing || !formData.jobUrl?.trim()}
                variant="outline"
              >
                {isParsing ? 'Fetching...' : 'Fetch Details'}
              </Button>
            </div>
            {isParsing && (
              <p className="text-xs text-muted-foreground">Parsing job posting details...</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">
                Company *
              </Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="position">
                Position *
              </Label>
              <Input
                id="position"
                name="position"
                type="text"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Remote, New York, NY"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dateApplied">
                Date Applied *
              </Label>
              <Input
                id="dateApplied"
                name="dateApplied"
                type="date"
                value={formData.dateApplied}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">
                Status *
              </Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="interested">Interested</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="salary">
                Salary
              </Label>
              <Input
                id="salary"
                name="salary"
                type="text"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $100k - $120k"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactName">
                Contact Name
              </Label>
              <Input
                id="contactName"
                name="contactName"
                type="text"
                value={formData.contactName}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactEmail">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes, interview dates, follow-ups, etc."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : application ? 'Update' : 'Add'} Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ApplicationForm;
