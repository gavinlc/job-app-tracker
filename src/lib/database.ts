import Database from 'better-sqlite3';
import { JobApplication } from '../types';

// Only initialize database on server side
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (typeof window !== 'undefined') {
    throw new Error('Database can only be accessed on the server side');
  }
  if (!db) {
    db = new Database('applications.db');
    // Initialize database schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        location TEXT,
        job_url TEXT,
        status TEXT NOT NULL DEFAULT 'interested',
        date_applied TEXT NOT NULL,
        notes TEXT,
        salary TEXT,
        contact_name TEXT,
        contact_email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK(status IN ('interested', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'))
      );

      CREATE INDEX IF NOT EXISTS idx_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_date_applied ON applications(date_applied);
      CREATE INDEX IF NOT EXISTS idx_company ON applications(company);
    `);
  }
  return db;
}

export const insertApplication = (() => {
  const db = getDb();
  return db.prepare(`
    INSERT INTO applications (company, position, location, job_url, status, date_applied, notes, salary, contact_name, contact_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
})();

export const getAllApplications = (() => {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM applications
    ORDER BY date_applied DESC, created_at DESC
  `);
})();

export const getApplicationById = (() => {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM applications
    WHERE id = ?
  `);
})();

export const getApplicationsByStatus = (() => {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM applications
    WHERE status = ?
    ORDER BY date_applied DESC, created_at DESC
  `);
})();

export const updateApplication = (() => {
  const db = getDb();
  return db.prepare(`
    UPDATE applications
    SET company = ?, position = ?, location = ?, job_url = ?, status = ?, date_applied = ?, 
        notes = ?, salary = ?, contact_name = ?, contact_email = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
})();

export const deleteApplication = (() => {
  const db = getDb();
  return db.prepare(`
    DELETE FROM applications
    WHERE id = ?
  `);
})();

export const searchApplications = (() => {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM applications
    WHERE company LIKE ? OR position LIKE ? OR notes LIKE ? OR location LIKE ?
    ORDER BY date_applied DESC, created_at DESC
  `);
})();

// Helper to convert database row to application object
export const rowToApplication = (row: any): JobApplication => ({
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

export default getDb;

