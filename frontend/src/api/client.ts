import axios from 'axios';
import { JobApplication } from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Applications API
export const applicationsApi = {
  getAll: (status?: string | null): Promise<JobApplication[]> => {
    const endpoint = status 
      ? `/applications/status/${status}`
      : '/applications';
    return apiClient.get<JobApplication[]>(endpoint).then(res => res.data);
  },

  getById: (id: number): Promise<JobApplication> => {
    return apiClient.get<JobApplication>(`/applications/${id}`).then(res => res.data);
  },

  search: (query: string): Promise<JobApplication[]> => {
    return apiClient.get<JobApplication[]>('/applications/search', {
      params: { q: query },
    }).then(res => res.data);
  },

  create: (application: JobApplication): Promise<JobApplication> => {
    return apiClient.post<JobApplication>('/applications', application).then(res => res.data);
  },

  update: (id: number, application: JobApplication): Promise<JobApplication> => {
    return apiClient.put<JobApplication>(`/applications/${id}`, application).then(res => res.data);
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete(`/applications/${id}`).then(() => undefined);
  },
};

// Statistics API
export const statisticsApi = {
  get: (): Promise<{ total: number; byStatus: Record<string, number> }> => {
    return apiClient.get('/statistics').then(res => res.data);
  },
};



