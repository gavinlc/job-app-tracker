export interface JobApplication {
  id?: number;
  company: string;
  position: string;
  location?: string;
  jobUrl?: string;
  status: 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  dateApplied: string;
  notes?: string;
  salary?: string;
  contactName?: string;
  contactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}
