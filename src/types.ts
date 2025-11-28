export interface JobApplication {
  id?: number;
  company: string;
  position: string;
  location?: string;
  jobUrl?: string;
  status: 'interested' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  dateApplied: string;
  notes?: string;
  salary?: string;
  contactName?: string;
  contactEmail?: string;
  isStarred?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
