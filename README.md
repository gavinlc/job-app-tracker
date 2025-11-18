# Job Application Tracker

A full-stack TypeScript application for tracking and managing your job applications. Built with React frontend and Node.js/Express backend, storing data in a local SQLite database.

## Features

- ➕ **Add Applications** - Track all your job applications with detailed information
- 📊 **Status Tracking** - Monitor applications by status (Applied, Interviewing, Offer, Rejected, Withdrawn)
- 🔍 **Search & Filter** - Quickly find applications by company, position, or status
- 📈 **Statistics Dashboard** - View overview of your application pipeline
- ✏️ **Edit & Update** - Update application details and status as you progress
- 🗑️ **Delete** - Remove applications you no longer need to track
- 💾 **Local Storage** - All data stored locally in SQLite database

## Tech Stack

### Backend

- **Node.js** with **TypeScript**
- **Express** for API server
- **better-sqlite3** for local database

### Frontend

- **React** with **TypeScript**
- **Vite** for build tooling
- **Axios** for API calls

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

### Running the Application

1. **Start the backend server:**

   ```bash
   npm run dev:backend
   ```

   The backend will run on `http://localhost:5000`

2. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev:frontend
   ```
   The frontend will run on `http://localhost:3000`

## Usage

1. Open the frontend in your browser at `http://localhost:3000`
2. Click **"+ Add Application"** to add a new job application
3. Fill in the details:
   - Company name
   - Position title
   - Location (optional)
   - Date applied
   - Status (Applied, Interviewing, Offer, Rejected, Withdrawn)
   - Job posting URL (optional)
   - Salary range (optional)
   - Contact information (optional)
   - Notes (optional)
4. View your applications in the list
5. Click on status cards in the statistics section to filter by status
6. Use the search bar to find specific applications
7. Click **Edit** to update an application's details or status
8. Click **Delete** to remove an application

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications/status/:status` - Get applications by status
- `GET /api/applications/search?q=query` - Search applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `GET /api/statistics` - Get application statistics

## Database

The application uses SQLite with a database file named `applications.db` in the backend directory. The schema includes:

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
├── backend/
│   ├── src/
│   │   ├── database.ts      # Database setup and queries
│   │   ├── index.ts         # Express server
│   │   └── types.ts         # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ApplicationList.tsx
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── Statistics.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── types.ts         # TypeScript types
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

## License

MIT
