import Database from 'better-sqlite3';
import { JobApplication } from './types.js';

const db = new Database('applications.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT,
    job_url TEXT,
    status TEXT NOT NULL DEFAULT 'applied',
    date_applied TEXT NOT NULL,
    notes TEXT,
    salary TEXT,
    contact_name TEXT,
    contact_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK(status IN ('applied', 'interviewing', 'offer', 'rejected', 'withdrawn'))
  );

  CREATE INDEX IF NOT EXISTS idx_status ON applications(status);
  CREATE INDEX IF NOT EXISTS idx_date_applied ON applications(date_applied);
  CREATE INDEX IF NOT EXISTS idx_company ON applications(company);
`);

export const insertApplication = db.prepare(`
  INSERT INTO applications (company, position, location, job_url, status, date_applied, notes, salary, contact_name, contact_email)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export const getAllApplications = db.prepare(`
  SELECT * FROM applications
  ORDER BY date_applied DESC, created_at DESC
`);

export const getApplicationById = db.prepare(`
  SELECT * FROM applications
  WHERE id = ?
`);

export const getApplicationsByStatus = db.prepare(`
  SELECT * FROM applications
  WHERE status = ?
  ORDER BY date_applied DESC, created_at DESC
`);

export const updateApplication = db.prepare(`
  UPDATE applications
  SET company = ?, position = ?, location = ?, job_url = ?, status = ?, date_applied = ?, 
      notes = ?, salary = ?, contact_name = ?, contact_email = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

export const deleteApplication = db.prepare(`
  DELETE FROM applications
  WHERE id = ?
`);

export const searchApplications = db.prepare(`
  SELECT * FROM applications
  WHERE company LIKE ? OR position LIKE ? OR notes LIKE ? OR location LIKE ?
  ORDER BY date_applied DESC, created_at DESC
`);

export default db;


