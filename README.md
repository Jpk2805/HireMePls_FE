# Scalable Job Processing System - Frontend

Web interface for the job processing platform. Create, monitor, and manage jobs.

## Quick Start

```bash
npm install
npm run dev
```

## Folder Structure

```
FE/
├── src/
│   ├── components/             # Reusable React components
│   │   ├── common/             # Common UI components (Button, Card, Modal, etc)
│   │   ├── layout/             # Layout components (Header, Sidebar, Footer)
│   │   ├── forms/              # Form components (LoginForm, JobForm, etc)
│   │   └── jobs/               # Job-specific components (JobCard, JobList, etc)
│   ├── pages/                  # Page components (Next.js/React Router)
│   │   ├── auth/               # Login, Register pages
│   │   ├── jobs/               # Job listing, details, create pages
│   │   └── dashboard/          # Dashboard page
│   ├── services/               # API client & HTTP requests
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Helper functions
│   ├── types/                  # TypeScript types & interfaces
│   ├── styles/                 # Global styles & theme
│   ├── context/                # React Context (auth, app state)
│   └── App.tsx                 # Root component
├── public/                     # Static assets
├── tests/                      # Unit & integration tests
├── .env.example                # Environment variables template
├── package.json
└── vite.config.ts (or next.config.js if using Next.js)
```

## Key Features

- **Authentication**: Login/Register with JWT
- **Job Management**: Create, view, cancel jobs
- **Real-time Updates**: WebSocket or polling for job status
- **Job Logging**: View detailed logs for each job
- **Dashboard**: Overview of all jobs and stats
- **Rate Limiting Feedback**: Display limits for different user plans

## Environment Variables

See `.env.example` for required variables.

## Tech Stack

- **Framework**: React 18+ (Vite) or Next.js
- **State Management**: React Context / Redux (optional)
- **HTTP Client**: Axios / Fetch API
- **Styling**: Tailwind CSS / Styled Components
- **Testing**: Jest + React Testing Library

## API Integration

All API calls go through `src/services/api.ts`:

```typescript
// Example
import { apiClient } from '@/services/api'

const jobs = await apiClient.get('/jobs')
```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests
npm run lint       # Lint code
```
