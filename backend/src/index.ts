import express from 'express';
import cors from 'cors';
import {
  getAllApplications,
  getApplicationById,
  getApplicationsByStatus,
  insertApplication,
  updateApplication,
  deleteApplication,
  searchApplications,
} from './database.js';
import { JobApplication } from './types.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper to convert database row to application object
const rowToApplication = (row: any): JobApplication => ({
  id: row.id,
  company: row.company,
  position: row.position,
  location: row.location || undefined,
  jobUrl: row.job_url || undefined,
  status: row.status,
  dateApplied: row.date_applied,
  notes: row.notes || undefined,
  salary: row.salary || undefined,
  contactName: row.contact_name || undefined,
  contactEmail: row.contact_email || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all applications
app.get('/api/applications', (req, res) => {
  try {
    const rows = getAllApplications.all();
    const applications = rows.map(rowToApplication);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application by ID
app.get('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = getApplicationById.get(parseInt(id));
    if (!row) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(rowToApplication(row));
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Get applications by status
app.get('/api/applications/status/:status', (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['applied', 'interviewing', 'offer', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const rows = getApplicationsByStatus.all(status);
    const applications = rows.map(rowToApplication);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications by status:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Search applications
app.get('/api/applications/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;
    const rows = searchApplications.all(searchTerm, searchTerm, searchTerm, searchTerm);
    const applications = rows.map(rowToApplication);
    res.json(applications);
  } catch (error) {
    console.error('Error searching applications:', error);
    res.status(500).json({ error: 'Failed to search applications' });
  }
});

// Create new application
app.post('/api/applications', (req, res) => {
  try {
    const application: JobApplication = req.body;

    // Validation
    if (!application.company || !application.position || !application.dateApplied) {
      return res.status(400).json({ error: 'Company, position, and date applied are required' });
    }

    if (!['applied', 'interviewing', 'offer', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = insertApplication.run(
      application.company,
      application.position,
      application.location || null,
      application.jobUrl || null,
      application.status,
      application.dateApplied,
      application.notes || null,
      application.salary || null,
      application.contactName || null,
      application.contactEmail || null
    );

    const newApplication = getApplicationById.get(result.lastInsertRowid);
    res.status(201).json(rowToApplication(newApplication));
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application
app.put('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;
    const application: JobApplication = req.body;

    // Check if application exists
    const existing = getApplicationById.get(parseInt(id));
    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Validation
    if (!application.company || !application.position || !application.dateApplied) {
      return res.status(400).json({ error: 'Company, position, and date applied are required' });
    }

    if (!['applied', 'interviewing', 'offer', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    updateApplication.run(
      application.company,
      application.position,
      application.location || null,
      application.jobUrl || null,
      application.status,
      application.dateApplied,
      application.notes || null,
      application.salary || null,
      application.contactName || null,
      application.contactEmail || null,
      parseInt(id)
    );

    const updated = getApplicationById.get(parseInt(id));
    res.json(rowToApplication(updated));
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
app.delete('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if application exists
    const existing = getApplicationById.get(parseInt(id));
    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    deleteApplication.run(parseInt(id));
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Get statistics
app.get('/api/statistics', (req, res) => {
  try {
    const allRows = getAllApplications.all();
    const total = allRows.length;
    const byStatus = allRows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      total,
      byStatus,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
