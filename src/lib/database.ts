import { neon } from '@neondatabase/serverless';
import { JobApplication } from '../types';

const sql = neon(process.env.DATABASE_URL!);

export async function getAllApplications() {
  const rows = await sql`SELECT * FROM applications ORDER BY date_applied DESC, created_at DESC`;
  return rows.map(rowToApplication);
}

export async function getApplicationById(id: number) {
  const rows = await sql`SELECT * FROM applications WHERE id = ${id}`;
  return rows.length ? rowToApplication(rows[0]) : null;
}

export async function getApplicationsByStatus(status: string) {
  const rows = await sql`SELECT * FROM applications WHERE status = ${status} ORDER BY date_applied DESC, created_at DESC`;
  return rows.map(rowToApplication);
}

export async function insertApplication(application: JobApplication) {
  const { company, position, location, jobUrl, status, dateApplied, notes, salary, contactName, contactEmail } = application;
  const rows = await sql`
    INSERT INTO applications (company, position, location, job_url, status, date_applied, notes, salary, contact_name, contact_email)
    VALUES (${company}, ${position}, ${location}, ${jobUrl}, ${status}, ${dateApplied}, ${notes}, ${salary}, ${contactName}, ${contactEmail})
    RETURNING *
  `;
  return rowToApplication(rows[0]);
}

export async function updateApplication(id: number, application: JobApplication) {
  const { company, position, location, jobUrl, status, dateApplied, notes, salary, contactName, contactEmail } = application;
  const rows = await sql`
    UPDATE applications SET
      company = ${company},
      position = ${position},
      location = ${location},
      job_url = ${jobUrl},
      status = ${status},
      date_applied = ${dateApplied},
      notes = ${notes},
      salary = ${salary},
      contact_name = ${contactName},
      contact_email = ${contactEmail},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return rowToApplication(rows[0]);
}

export async function deleteApplication(id: number) {
  await sql`DELETE FROM applications WHERE id = ${id}`;
  return { success: true };
}

export async function searchApplications(query: string) {
  const searchTerm = `%${query}%`;
  const rows = await sql`
    SELECT * FROM applications
    WHERE company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm}
    ORDER BY date_applied DESC, created_at DESC
  `;
  return rows.map(rowToApplication);
}

export function rowToApplication(row: any): JobApplication {
  return {
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
  };
}

