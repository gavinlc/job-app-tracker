# Job Application Tracker

A full-stack TypeScript application for tracking and managing your job applications. Built with **TanStack Start** - a full-stack framework powered by TanStack Router, featuring server-side rendering, server functions, and type-safe routing.

## Features

- ➕ **Add Applications** - Track all your job applications with detailed information
- 🤖 **AI-Powered URL Parsing** - Paste a job posting URL and let AI extract all the details automatically
- 📊 **Status Tracking** - Monitor applications by status (Applied, Interviewing, Offer, Rejected, Withdrawn)
- 🔍 **Search & Filter** - Quickly find applications by company, position, or status
- 📈 **Statistics Dashboard** - View overview of your application pipeline
- ✏️ **Edit & Update** - Update application details and status as you progress
- 🗑️ **Delete** - Remove applications you no longer need to track
- 💾 **Local Storage** - All data stored locally in SQLite database
- 🚀 **Full-Stack SSR** - Server-side rendering with TanStack Start

## Tech Stack

- **TanStack Start** - Full-stack React framework
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **React** with **TypeScript**
- **better-sqlite3** - Local SQLite database
- **Tailwind CSS** - Styling
- **Vinxi** - Build tooling

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up OpenAI API Key (optional but recommended for URL parsing):**
   - Create a `.env` file in the project root
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```
   - Get your API key from: https://platform.openai.com/api-keys
   - Note: If no API key is provided, the app will use basic regex parsing (less accurate)

### Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will run on `http://localhost:3000` (or the port configured by Vinxi)

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

## Usage

1. Open the application in your browser
2. Click **"+ Add Application"** to add a new job application
3. **Quick Add with URL (Recommended):**
   - Paste the job posting URL in the "Job Posting URL" field
   - Click **"Fetch Details"** to automatically extract:
     - Company name
     - Position title
     - Location
     - Salary range
     - Job description/notes
   - Review and edit the auto-filled information
   - Fill in any remaining details and save
4. **Manual Entry:**
   - Fill in the details manually:
     - Company name
     - Position title
     - Location (optional)
     - Date applied
     - Status (Applied, Interviewing, Offer, Rejected, Withdrawn)
     - Job posting URL (optional)
     - Salary range (optional)
     - Contact information (optional)
     - Notes (optional)
5. View your applications in the list
6. Click on status cards in the statistics section to filter by status
7. Use the search bar to find specific applications
8. Click **Edit** to update an application's details or status
9. Click **Delete** to remove an application

## Server Functions

The application uses TanStack Start server functions instead of REST API endpoints:

- `getAllApplicationsFn` - Get all applications (optionally filtered by status)
- `getApplicationByIdFn` - Get application by ID
- `searchApplicationsFn` - Search applications
- `createApplicationFn` - Create new application
- `updateApplicationFn` - Update application
- `deleteApplicationFn` - Delete application
- `getStatisticsFn` - Get application statistics
- `parseJobPostingFn` - Parse job posting from URL using AI (with regex fallback)

## Database

The application uses SQLite with a database file named `applications.db` in the project root. The schema includes:

- `id` - Primary key
- `company` - Company name
- `position` - Job position/title
- `location` - Job location
- `job_url` - URL to job posting
- `status` - Application status (applied, interviewing, offer, rejected, withdrawn)
- `date_applied` - Date when application was submitted
- `notes` - Additional notes
- `salary` - Salary range/offer
- `contact_name` - Contact person name
- `contact_email` - Contact email
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

## Project Structure

```
job-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── ApplicationList.tsx
│   │   ├── ApplicationForm.tsx
│   │   ├── Statistics.tsx
│   │   └── SearchBar.tsx
│   ├── routes/             # TanStack Router routes
│   │   ├── __root.tsx      # Root route with providers
│   │   └── index.tsx        # Home route
│   ├── lib/                # Server functions and database
│   │   ├── database.ts     # Database setup and queries
│   │   └── server.ts       # Server functions
│   ├── hooks/              # React Query hooks
│   │   ├── useApplications.ts
│   │   └── useStatistics.ts
│   ├── App.tsx             # Main app component
│   ├── router.tsx          # Router configuration
│   ├── entry-client.tsx    # Client entry point
│   ├── entry-server.tsx    # Server entry point
│   └── types.ts            # TypeScript types
├── app.config.ts           # TanStack Start configuration
├── package.json
├── tsconfig.json
└── applications.db         # SQLite database file
```

## License

MIT
