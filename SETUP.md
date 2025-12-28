# Exametrics Frontend - Setup Guide

## Overview
Comprehensive Next.js application for exam results management and analytics, integrated with FastAPI backend.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: TailwindCSS 4
- **State Management**: React Context + Zustand
- **API Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
exametrics-frontend/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── exams/page.tsx        # Exam management
│   │   ├── results/page.tsx      # Results & PDF downloads
│   │   ├── analytics/page.tsx    # Charts & statistics
│   │   └── schools/page.tsx      # School analysis
│   ├── login/page.tsx            # Authentication
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── DashboardLayout.tsx       # Main layout with nav
│   ├── ExamSelector.tsx          # Persistent exam selector
│   └── ProtectedRoute.tsx        # Auth guard
├── contexts/
│   ├── AuthContext.tsx           # Authentication state
│   └── ExamContext.tsx           # Selected exam persistence
├── lib/
│   ├── api.ts                    # API client & endpoints
│   └── utils.ts                  # Utility functions
└── env.local                     # Environment variables
```

## Key Features

### 1. **Dashboard** (`/dashboard`)
- Overview statistics with exam selection
- Division distribution charts
- Top performing schools
- Real-time data from selected exam

### 2. **Exams Module** (`/dashboard/exams`)
- List all available exams
- Registration statistics by region/council/ward
- Subject enrollment data
- School type distribution

### 3. **Results Module** (`/dashboard/results`)
- School progress tracking
- PDF report downloads
- Division summaries
- Performance metrics

### 4. **Analytics Module** (`/dashboard/analytics`)
- Comprehensive statistics
- Division & grade distributions
- School rankings (overall, region, council, ward)
- Performance trends

### 5. **Schools Module** (`/dashboard/schools`)
- Detailed school analysis
- Subject-wise performance
- Multi-level rankings
- Comparison tools

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create/update `env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.kiyabo.com/api/v1
```

For local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production
```bash
npm run build
npm start
```

## Architecture Highlights

### Exam Context Persistence
The app uses React Context to persist selected exam across all pages:
- Stored in localStorage
- Automatically restored on page reload
- Available globally via `useExam()` hook

### API Integration
All FastAPI endpoints are integrated:
- `/exams` - Exam management
- `/results` - Results & analysis
- `/exams/{id}/stats` - Statistics
- `/exams/{id}/analyses/*` - School analysis
- PDF downloads with blob handling

### Authentication Flow
1. Login via `/login`
2. JWT token stored in localStorage
3. Protected routes check authentication
4. Auto-redirect on unauthorized access

### UI Components
Modern, accessible components using:
- Radix UI primitives
- TailwindCSS for styling
- Responsive design
- Loading states
- Error handling

## API Endpoints Used

### Exams
- `GET /exams` - List all exams
- `GET /exams/{id}` - Get exam details
- `GET /exams/registration-stats/{id}` - Registration statistics

### Results
- `GET /results/progress/{exam_id}` - School progress
- `GET /results/results/pdf/{exam_id}/{centre_number}` - Download PDF

### Analytics
- `GET /exams/{exam_id}/stats` - Exam statistics
- `GET /exams/{exam_id}/analyses/rankings` - School rankings
- `GET /exams/{exam_id}/analyses/overviews` - School overviews

### Schools
- `GET /exams/{exam_id}/schools/{centre_number}/analysis/full` - Full analysis
- `GET /exams/{exam_id}/schools/{centre_number}/analysis/subjects` - Subject performance
- `GET /exams/{exam_id}/schools/{centre_number}/analysis/divisions` - Division summary

## Development Notes

### Adding New Features
1. Create page in `app/dashboard/[feature]/page.tsx`
2. Add route to navigation in `DashboardLayout.tsx`
3. Add API functions in `lib/api.ts`
4. Use `useExam()` for selected exam context

### Styling Guidelines
- Use TailwindCSS utility classes
- Follow shadcn/ui component patterns
- Maintain consistent spacing (4, 6, 8 units)
- Use semantic color tokens

### State Management
- **Auth**: `useAuth()` from AuthContext
- **Exam Selection**: `useExam()` from ExamContext
- **Local State**: useState for component-specific data
- **Server State**: Fetch on mount, store in local state

## Common Tasks

### Add New API Endpoint
```typescript
// lib/api.ts
export const getNewData = async (examId: string) => {
  const response = await api.get(`/new-endpoint/${examId}`);
  return response.data;
};
```

### Create New Dashboard Page
```typescript
// app/dashboard/new-page/page.tsx
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useExam } from '@/contexts/ExamContext';

export default function NewPage() {
  const { selectedExam } = useExam();
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Your content */}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
```

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` in env.local
- Check FastAPI backend is running
- Verify CORS settings on backend

### Authentication Errors
- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Verify backend auth endpoints

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

## Performance Optimization
- API responses are cached in component state
- Lazy loading for heavy components
- Optimized images with Next.js Image
- Code splitting by route

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License
Proprietary - All rights reserved
