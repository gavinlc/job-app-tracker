import { neon } from '@neondatabase/serverless';
import { JobApplication } from '../types';

const sql = neon(process.env.DATABASE_URL!);

export async function getAllApplications(starredOnly?: boolean, activeOnly?: boolean) {
  if (starredOnly && activeOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE is_starred = true AND status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (starredOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (activeOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  const rows = await sql`SELECT * FROM applications ORDER BY is_starred DESC, date_applied DESC, created_at DESC`;
  return rows.map(rowToApplication);
}

export async function getApplicationById(id: number) {
  const rows = await sql`SELECT * FROM applications WHERE id = ${id}`;
  return rows.length ? rowToApplication(rows[0]) : null;
}

export async function getApplicationsByStatus(status: string, starredOnly?: boolean, activeOnly?: boolean) {
  // If activeOnly is true and the selected status is rejected or withdrawn, return empty
  // since those are not active statuses
  if (activeOnly && (status === 'rejected' || status === 'withdrawn')) {
    return [];
  }
  
  if (starredOnly && activeOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE status = ${status} AND is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (starredOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE status = ${status} AND is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (activeOnly) {
    // activeOnly is redundant here since we already filtered by status, but keep for consistency
    const rows = await sql`
      SELECT * FROM applications 
      WHERE status = ${status}
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  const rows = await sql`
    SELECT * FROM applications 
    WHERE status = ${status}
    ORDER BY is_starred DESC, date_applied DESC, created_at DESC
  `;
  return rows.map(rowToApplication);
}

export async function insertApplication(application: JobApplication) {
  const { company, position, location, jobUrl, status, dateApplied, notes, salary, contactName, contactEmail, isStarred } = application;
  const rows = await sql`
    INSERT INTO applications (company, position, location, job_url, status, date_applied, notes, salary, contact_name, contact_email, is_starred)
    VALUES (${company}, ${position}, ${location}, ${jobUrl}, ${status}, ${dateApplied}, ${notes}, ${salary}, ${contactName}, ${contactEmail}, ${isStarred ?? false})
    RETURNING *
  `;
  return rowToApplication(rows[0]);
}

export async function updateApplication(id: number, application: JobApplication) {
  const { company, position, location, jobUrl, status, dateApplied, notes, salary, contactName, contactEmail, isStarred } = application;
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
      is_starred = ${isStarred ?? false},
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

export async function searchApplications(query: string, starredOnly?: boolean, activeOnly?: boolean) {
  const searchTerm = `%${query}%`;
  
  if (starredOnly && activeOnly) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE (company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm})
      AND is_starred = true
      AND status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (starredOnly) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE (company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm})
      AND is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (activeOnly) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE (company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm})
      AND status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  const rows = await sql`
    SELECT * FROM applications
    WHERE company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm}
    ORDER BY is_starred DESC, date_applied DESC, created_at DESC
  `;
  return rows.map(rowToApplication);
}

export async function toggleStarApplication(id: number) {
  const rows = await sql`
    UPDATE applications 
    SET is_starred = NOT is_starred,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return rowToApplication(rows[0]);
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
    isStarred: row.is_starred ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

