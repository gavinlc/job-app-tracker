import { neon } from '@neondatabase/serverless';
import { JobApplication } from '../types';

const sql = neon(process.env.DATABASE_URL!);

export async function getAllApplications(userId: string, starredOnly?: boolean, activeOnly?: boolean) {
  if (!userId) {
    return [];
  }
  
  if (starredOnly && activeOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE user_id = ${userId} AND is_starred = true AND status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (starredOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE user_id = ${userId} AND is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (activeOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE user_id = ${userId} AND status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  const rows = await sql`
    SELECT * FROM applications 
    WHERE user_id = ${userId}
    ORDER BY is_starred DESC, date_applied DESC, created_at DESC
  `;
  return rows.map(rowToApplication);
}

export async function getApplicationById(id: number, userId: string) {
  if (!userId) {
    return null;
  }
  const rows = await sql`SELECT * FROM applications WHERE id = ${id} AND user_id = ${userId}`;
  return rows.length ? rowToApplication(rows[0]) : null;
}

export async function getApplicationsByStatus(status: string, userId: string, starredOnly?: boolean, activeOnly?: boolean) {
  if (!userId) {
    return [];
  }
  
  // If activeOnly is true and the selected status is rejected or withdrawn, return empty
  // since those are not active statuses
  if (activeOnly && (status === 'rejected' || status === 'withdrawn')) {
    return [];
  }
  
  if (starredOnly && activeOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE user_id = ${userId} AND status = ${status} AND is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (starredOnly) {
    const rows = await sql`
      SELECT * FROM applications 
      WHERE user_id = ${userId} AND status = ${status} AND is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (activeOnly) {
    // activeOnly is redundant here since we already filtered by status, but keep for consistency
    const rows = await sql`
      SELECT * FROM applications 
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  const rows = await sql`
    SELECT * FROM applications 
    WHERE user_id = ${userId} AND status = ${status}
    ORDER BY is_starred DESC, date_applied DESC, created_at DESC
  `;
  return rows.map(rowToApplication);
}

export async function insertApplication(application: JobApplication, userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  const { company, position, location, jobUrl, status, dateApplied, notes, salary, contactName, contactEmail, isStarred } = application;
  const rows = await sql`
    INSERT INTO applications (company, position, location, job_url, status, date_applied, notes, salary, contact_name, contact_email, is_starred, user_id)
    VALUES (${company}, ${position}, ${location}, ${jobUrl}, ${status}, ${dateApplied}, ${notes}, ${salary}, ${contactName}, ${contactEmail}, ${isStarred ?? false}, ${userId})
    RETURNING *
  `;
  return rowToApplication(rows[0]);
}

export async function updateApplication(id: number, application: JobApplication, userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }
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
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  if (rows.length === 0) {
    throw new Error('Application not found or access denied');
  }
  return rowToApplication(rows[0]);
}

export async function deleteApplication(id: number, userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  await sql`DELETE FROM applications WHERE id = ${id} AND user_id = ${userId}`;
  return { success: true };
}

export async function searchApplications(query: string, userId: string, starredOnly?: boolean, activeOnly?: boolean) {
  if (!userId) {
    return [];
  }
  const searchTerm = `%${query}%`;
  
  if (starredOnly && activeOnly) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE user_id = ${userId}
      AND (company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm})
      AND is_starred = true
      AND status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (starredOnly) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE user_id = ${userId}
      AND (company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm})
      AND is_starred = true
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  if (activeOnly) {
    const rows = await sql`
      SELECT * FROM applications
      WHERE user_id = ${userId}
      AND (company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm})
      AND status NOT IN ('rejected', 'withdrawn')
      ORDER BY date_applied DESC, created_at DESC
    `;
    return rows.map(rowToApplication);
  }
  
  const rows = await sql`
    SELECT * FROM applications
    WHERE user_id = ${userId}
    AND (company ILIKE ${searchTerm} OR position ILIKE ${searchTerm} OR notes ILIKE ${searchTerm} OR location ILIKE ${searchTerm})
    ORDER BY is_starred DESC, date_applied DESC, created_at DESC
  `;
  return rows.map(rowToApplication);
}

export async function toggleStarApplication(id: number, userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  const rows = await sql`
    UPDATE applications 
    SET is_starred = NOT is_starred,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  if (rows.length === 0) {
    throw new Error('Application not found or access denied');
  }
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
    userId: row.user_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

