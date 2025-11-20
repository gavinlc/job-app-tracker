# Job Application Tracker

A full-stack TypeScript application for tracking and managing your job applications. Built with **React**, **TanStack Router**, and **Neon Auth** for authentication, featuring multiple view modes, search, filtering, and AI-powered job posting parsing.

## Features

### Application Management
- ➕ **Add Applications** - Track all your job applications with detailed information
- 🤖 **AI-Powered URL Parsing** - Paste a job posting URL and let AI extract all the details automatically
- 📊 **Status Tracking** - Monitor applications by status (Applied, Interviewing, Offer, Rejected, Withdrawn)
- 🔍 **Search & Filter** - Quickly find applications by company, position, or status
- 📈 **Statistics Dashboard** - View overview of your application pipeline
- ✏️ **Edit & Update** - Update application details and status as you progress
- 🗑️ **Delete** - Remove applications you no longer need to track
- 📋 **Multiple View Modes** - View applications in List, Table, or Kanban board format

### Authentication
- 🔐 **User Authentication** - Secure sign up and sign in with Neon Auth
- 🔒 **Protected Routes** - Main application requires authentication
- 🔑 **Password Reset** - Forgot password flow with email verification
- 👤 **User Management** - Sign out and user profile display

## Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **TanStack Router** - Type-safe routing with SSR support
- **TanStack Query** - Data fetching and caching
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **@dnd-kit** - Drag and drop for Kanban board

### Backend & Database
- **Nitro** - Server framework
- **Neon Database** - Serverless Postgres database
- **Neon Auth** - Authentication service (via @stackframe/js)

### AI & Services
- **OpenAI** - Job posting URL parsing

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Neon account (for database and authentication)
- OpenAI API key (optional, for URL parsing)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Neon Auth

1. Create a [Neon account](https://neon.tech) or use an existing one
2. Create a new Neon project or use an existing one
3. Navigate to **Neon Auth** in your Neon dashboard
4. Click **"Connect"** and complete the OAuth flow to set up Neon Auth
5. Copy your Neon Auth credentials from the dashboard

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Neon Auth Configuration
VITE_STACK_PROJECT_ID=your_neon_auth_project_id
VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_neon_auth_publishable_key
STACK_SECRET_SERVER_KEY=your_neon_auth_secret_key

# Neon Database Connection
DATABASE_URL=your_neon_connection_string

# OpenAI API Key (optional, for URL parsing)
OPENAI_API_KEY=your_openai_api_key_here
```

**Getting your credentials:**
- **Neon Auth keys**: Available in the Neon Auth dashboard after setup
- **DATABASE_URL**: Your Neon database connection string (found in Neon dashboard)
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
  - Note: If no API key is provided, the app will use basic regex parsing (less accurate)

### 4. Run the Application

**Development:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Production Build:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run serve
```

## Usage

### Authentication

1. **Sign Up**: Navigate to `/sign-up` to create a new account
2. **Sign In**: Navigate to `/sign-in` to sign in to your account
3. **Forgot Password**: Click "Forgot password?" on the sign-in page to reset your password
4. **Protected Routes**: The main application requires authentication - you'll be redirected to sign-in if not logged in

### Managing Applications

1. **Add Application**:
   - Click **"+ Add Application"** button
   - **Quick Add with URL (Recommended)**:
     - Paste the job posting URL in the "Job Posting URL" field
     - Click **"Fetch Details"** to automatically extract:
       - Company name
       - Position title
       - Location
       - Salary range
       - Job description/notes
     - Review and edit the auto-filled information
   - **Manual Entry**: Fill in details manually:
     - Company name
     - Position title
     - Location (optional)
     - Date applied
     - Status (Applied, Interviewing, Offer, Rejected, Withdrawn)
     - Job posting URL (optional)
     - Salary range (optional)
     - Contact information (optional)
     - Notes (optional)

2. **View Applications**:
   - **List View**: Default view showing applications as cards
   - **Table View**: Tabular format for easy scanning
   - **Kanban View**: Drag-and-drop board organized by status

3. **Search & Filter**:
   - Use the search bar to find applications by company, position, or other details
   - Click status cards in the statistics section to filter by status
   - Click "Clear Filter" to remove status filters

4. **Edit Application**:
   - Click **Edit** on any application card
   - Update details and save

5. **Delete Application**:
   - Click **Delete** on any application card
   - Confirm deletion in the dialog

6. **Change Status** (Kanban View):
   - Drag and drop cards between status columns to update status

## Project Structure

```
job-app-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── ApplicationList.tsx
│   │   ├── ApplicationTable.tsx
│   │   ├── ApplicationForm.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── Statistics.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   └── ui/              # shadcn/ui components
│   ├── routes/             # TanStack Router routes
│   │   ├── __root.tsx       # Root route
│   │   ├── index.tsx        # Home route (protected)
│   │   ├── sign-in.tsx      # Sign in page
│   │   ├── sign-up.tsx      # Sign up page
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   └── handler.password-reset.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useApplications.ts
│   │   ├── useStatistics.ts
│   │   └── useAuth.ts       # Authentication hook
│   ├── lib/                # Utilities and configuration
│   │   ├── database.ts      # Database setup
│   │   ├── server.ts        # Server functions
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx             # Main app component
│   ├── router.tsx          # Router configuration
│   ├── stack.ts            # Neon Auth client setup
│   ├── entry-client.tsx    # Client entry point
│   ├── entry-server.tsx    # Server entry point
│   └── types.ts            # TypeScript types
├── public/                 # Static assets
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json
└── tsconfig.json
```

## Authentication Flow

The application uses **Neon Auth** (powered by Stack Auth) for authentication:

1. **Sign Up**: Users create accounts with email and password
2. **Sign In**: Users authenticate with credentials
3. **Password Reset**: Users can request password reset via email
4. **Protected Routes**: Main application routes require authentication
5. **Session Management**: Authentication state is managed via cookies

## Database Schema

The application uses Neon Postgres database. The schema includes:

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

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run start` - Start production server (if configured)

### Type Safety

The project uses TypeScript for type safety throughout:
- Type-safe routing with TanStack Router
- Type-safe API calls with TanStack Query
- Type-safe database queries

## License

MIT
