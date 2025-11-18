import { createServerFn } from '@tanstack/react-start'
import {
  getAllApplications,
  getApplicationById,
  getApplicationsByStatus,
  insertApplication,
  updateApplication,
  deleteApplication,
  searchApplications,
  rowToApplication,
} from './database'
import { JobApplication } from '../types'

// Get all applications
export const getAllApplicationsFn = createServerFn()
  .inputValidator((input: { status?: string | null }) => input)
  .handler(async ({ data }) => {
    try {
      const { status } = data
      const rows = status
        ? getApplicationsByStatus.all(status)
        : getAllApplications.all()
      return rows.map(rowToApplication)
    } catch (error) {
      console.error('Error fetching applications:', error)
      throw new Error('Failed to fetch applications')
    }
  })

// Get application by ID
export const getApplicationByIdFn = createServerFn()
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    try {
      const { id } = data
      const row = getApplicationById.get(id)
      if (!row) {
        throw new Error('Application not found')
      }
      return rowToApplication(row)
    } catch (error) {
      console.error('Error fetching application:', error)
      throw error instanceof Error ? error : new Error('Failed to fetch application')
    }
  })

// Search applications
export const searchApplicationsFn = createServerFn()
  .inputValidator((input: { query: string }) => input)
  .handler(async ({ data }) => {
    try {
      const { query } = data
      if (!query || query.trim().length === 0) {
        return []
      }
      const searchTerm = `%${query}%`
      const rows = searchApplications.all(searchTerm, searchTerm, searchTerm, searchTerm)
      return rows.map(rowToApplication)
    } catch (error) {
      console.error('Error searching applications:', error)
      throw new Error('Failed to search applications')
    }
  })

// Create application
export const createApplicationFn = createServerFn()
  .inputValidator((input: { application: JobApplication }) => input)
  .handler(async ({ data }) => {
    try {
      const { application } = data

      if (!application.company || !application.position || !application.dateApplied) {
        throw new Error('Company, position, and date applied are required')
      }

      if (!['interested', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'].includes(application.status)) {
        throw new Error('Invalid status')
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
      )

      const newApplication = getApplicationById.get(result.lastInsertRowid as number)
      return rowToApplication(newApplication)
    } catch (error) {
      console.error('Error creating application:', error)
      throw error instanceof Error ? error : new Error('Failed to create application')
    }
  })

// Update application
export const updateApplicationFn = createServerFn()
  .inputValidator((input: { id: number; application: JobApplication }) => input)
  .handler(async ({ data }) => {
    try {
      const { id, application } = data

      const existing = getApplicationById.get(id)
      if (!existing) {
        throw new Error('Application not found')
      }

      if (!application.company || !application.position || !application.dateApplied) {
        throw new Error('Company, position, and date applied are required')
      }

      if (!['interested', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'].includes(application.status)) {
        throw new Error('Invalid status')
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
        id
      )

      const updated = getApplicationById.get(id)
      return rowToApplication(updated)
    } catch (error) {
      console.error('Error updating application:', error)
      throw error instanceof Error ? error : new Error('Failed to update application')
    }
  })

// Delete application
export const deleteApplicationFn = createServerFn()
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    try {
      const { id } = data

      const existing = getApplicationById.get(id)
      if (!existing) {
        throw new Error('Application not found')
      }

      deleteApplication.run(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting application:', error)
      throw error instanceof Error ? error : new Error('Failed to delete application')
    }
  })

// Get statistics
export const getStatisticsFn = createServerFn()
  .inputValidator((input: undefined) => input)
  .handler(async () => {
    try {
      const allRows = getAllApplications.all()
      const total = allRows.length
      const byStatus: Record<string, number> = allRows.reduce((acc: Record<string, number>, row: any) => {
        const status = row.status as string
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total,
        byStatus,
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw new Error('Failed to fetch statistics')
    }
  })

// Parse job posting from URL
export const parseJobPostingFn = createServerFn()
  .inputValidator((input: { url: string }) => input)
  .handler(async ({ data }) => {
    try {
      const { url } = data

      if (!url || !url.startsWith('http')) {
        throw new Error('Invalid URL')
      }

      // Fetch the URL
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`)
      }

      const html = await response.text()

      // Try AI parsing first, fallback to regex parsing
      const apiKey = process.env.OPENAI_API_KEY

      if (apiKey) {
        try {
          const parsed = await parseJobPostingWithAI(html, url, apiKey)
          if (parsed && (parsed.company || parsed.position)) {
            return parsed
          }
        } catch (aiError: any) {
          // Check for specific API errors
          const errorMessage = aiError?.message || String(aiError)
          const isQuotaError = errorMessage.includes('quota') ||
            errorMessage.includes('insufficient_quota') ||
            aiError?.code === 'insufficient_quota'
          const isAuthError = errorMessage.includes('api key') ||
            errorMessage.includes('authentication') ||
            aiError?.code === 'invalid_api_key'

          if (isQuotaError) {
            console.warn('OpenAI quota exceeded, falling back to regex parsing')
          } else if (isAuthError) {
            console.warn('OpenAI API key invalid, falling back to regex parsing')
          } else {
            console.warn('AI parsing failed, falling back to regex:', errorMessage)
          }
        }
      }

      // Fallback to regex parsing
      const parsed = parseJobPostingHTML(html, url)
      return parsed
    } catch (error) {
      console.error('Error parsing job posting:', error)
      throw error instanceof Error ? error : new Error('Failed to parse job posting')
    }
  })

// Helper function to parse job posting using AI
async function parseJobPostingWithAI(html: string, url: string, apiKey: string): Promise<Partial<JobApplication>> {
  // Clean HTML to reduce token usage
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 8000) // Limit to ~8000 chars to stay within token limits

  const { OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey })

  const prompt = `Extract job posting details from the following HTML content. Return ONLY a valid JSON object with these fields (use null for missing values):
{
  "company": "string or null",
  "position": "string or null", 
  "location": "string or null",
  "salary": "string or null (e.g., '$100k - $120k' or '£50,000 - £60,000')",
  "notes": "string or null (job description, requirements, or key details, max 1000 chars)"
}

HTML content:
${cleanHtml}

Return only the JSON object, no other text.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured data from job postings. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('No response from AI')
    }

    // Extract JSON from response (handle cases where AI adds markdown formatting)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      jobUrl: url,
      status: 'interested',
      dateApplied: new Date().toISOString().split('T')[0],
      company: parsed.company || undefined,
      position: parsed.position || undefined,
      location: parsed.location || undefined,
      salary: parsed.salary || undefined,
      notes: parsed.notes ? parsed.notes.substring(0, 1000) : undefined,
    }
  } catch (error: any) {
    // Re-throw with more context for quota/auth errors
    if (error?.error?.code === 'insufficient_quota' || error?.code === 'insufficient_quota') {
      const quotaError = new Error('OpenAI API quota exceeded')
        ; (quotaError as any).code = 'insufficient_quota'
      throw quotaError
    }
    if (error?.error?.code === 'invalid_api_key' || error?.code === 'invalid_api_key') {
      const authError = new Error('OpenAI API key is invalid')
        ; (authError as any).code = 'invalid_api_key'
      throw authError
    }
    // Re-throw other errors as-is
    throw error
  }
}

// Helper function to parse job posting HTML (fallback)
function parseJobPostingHTML(html: string, url: string): Partial<JobApplication> {
  const result: Partial<JobApplication> = {
    jobUrl: url,
    status: 'interested',
    dateApplied: new Date().toISOString().split('T')[0],
  }

  // Remove script and style tags
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  // Extract text content
  const textContent = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  // Try to extract title (common patterns)
  const titlePatterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<title[^>]*>([^<]+)<\/title>/i,
    /"jobTitle"[^>]*>([^<]+)</i,
    /"title"[^>]*>([^<]+)</i,
    /class="[^"]*title[^"]*"[^>]*>([^<]+)</i,
  ]

  for (const pattern of titlePatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      const title = match[1].trim()
      // Try to split title into position and company
      const parts = title.split(/[-|•|at|@]/).map(p => p.trim())
      if (parts.length >= 2) {
        result.position = parts[0]
        result.company = parts[parts.length - 1]
      } else {
        result.position = title
      }
      break
    }
  }

  // Extract company name (common patterns)
  if (!result.company) {
    const companyPatterns = [
      /"companyName"[^>]*>([^<]+)</i,
      /"employer"[^>]*>([^<]+)</i,
      /class="[^"]*company[^"]*"[^>]*>([^<]+)</i,
      /<span[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/span>/i,
    ]

    for (const pattern of companyPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        result.company = match[1].trim()
        break
      }
    }
  }

  // Extract location
  const locationPatterns = [
    /"jobLocation"[^>]*>([^<]+)</i,
    /"location"[^>]*>([^<]+)</i,
    /class="[^"]*location[^"]*"[^>]*>([^<]+)</i,
    /(?:Location|Location:)\s*([^<\n]+)/i,
  ]

  for (const pattern of locationPatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      result.location = match[1].trim().replace(/<[^>]+>/g, '').substring(0, 200)
      break
    }
  }

  // Extract salary
  const salaryPatterns = [
    /\$[\d,]+(?:k|K|,\d{3})*(?:\s*-\s*\$[\d,]+(?:k|K|,\d{3})*)?/,
    /(?:Salary|Compensation|Pay)[:\s]*\$?[\d,]+(?:k|K)?(?:\s*-\s*\$?[\d,]+(?:k|K)?)?/i,
    /£[\d,]+(?:k|K)?(?:\s*-\s*£[\d,]+(?:k|K)?)?/,
    /€[\d,]+(?:k|K)?(?:\s*-\s*€[\d,]+(?:k|K)?)?/,
  ]

  for (const pattern of salaryPatterns) {
    const match = textContent.match(pattern)
    if (match) {
      result.salary = match[0].trim().substring(0, 100)
      break
    }
  }

  // Extract description/notes (first few paragraphs)
  const descPatterns = [
    /"description"[^>]*>([\s\S]{0,500})</i,
    /class="[^"]*description[^"]*"[^>]*>([\s\S]{0,500})</i,
    /<p[^>]*>([\s\S]{0,500})<\/p>/i,
  ]

  for (const pattern of descPatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      const desc = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (desc.length > 20) {
        result.notes = desc.substring(0, 1000)
        break
      }
    }
  }

  // Clean up extracted values
  if (result.company) {
    result.company = result.company.replace(/<[^>]+>/g, '').trim().substring(0, 200)
  }
  if (result.position) {
    result.position = result.position.replace(/<[^>]+>/g, '').trim().substring(0, 200)
  }
  if (result.location) {
    result.location = result.location.replace(/<[^>]+>/g, '').trim().substring(0, 200)
  }

  return result
}

