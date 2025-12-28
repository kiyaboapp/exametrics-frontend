# Exametrics Frontend

Frontend for **Exametrics** — a dashboard for exam management, analytics, rankings, and downloadable reports.

This app is built with the **Next.js App Router** and integrates with the Exametrics **FastAPI** backend.

## Features

- **Authentication** (token-based)
- **Dashboard** (exam selection + stats)
- **Results**
  - School results overview
  - Division distribution & performance analytics
  - School detail view and PDF downloads
- **Exams** analytics and registration statistics
- **Responsive UI** with reusable components

## Tech Stack

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Axios** for API requests
- **Recharts** for data visualizations

## Requirements

- Node.js 18+
- npm 9+

## Getting Started (Local Development)

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```

## Environment Variables

The frontend reads the API base URL from:

- `NEXT_PUBLIC_API_URL`

Example (local backend):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Production example:

```bash
NEXT_PUBLIC_API_URL=https://exametrics.kiyabo.com/api/v1
```

## Scripts

- `npm run dev`
  - Start dev server
- `npm run build`
  - Production build
- `npm run start`
  - Start production server
- `npm run lint`
  - Run ESLint

## Authentication Notes (Important)

The FastAPI backend implements:

- `POST /auth/login` using `OAuth2PasswordRequestForm`

That means the login request must be:

- `Content-Type: application/x-www-form-urlencoded`
- Body fields include:
  - `username`
  - `password`

The frontend login implementation is in `lib/api.ts` and uses `URLSearchParams` to send form-encoded data.

Auth state is managed by:

- `contexts/AuthContext.tsx`
- Route guarding via `components/ProtectedRoute.tsx`

## Project Structure (high-level)

```text
app/
  login/               Login page
  dashboard/           Protected dashboard routes
components/            Layout + UI components
contexts/              AuthContext + ExamContext
lib/                   API client and utilities
types/                 Shared TypeScript types
```

## Troubleshooting

### Login fails with `Field required (username/password)`

Your request is likely being sent as JSON. The backend expects **form-encoded** payload for `/auth/login`.

### Login succeeds but redirects back to `/login`

This usually means auth state isn't set in `AuthContext`.

Make sure the login page uses `useAuth().login(...)` (not a direct API call), so the context sets:

- `localStorage.token`
- `localStorage.user`
- `setUser(...)`

### API calls return 401

- Confirm you are logged in and `localStorage.token` exists.
- The Axios interceptor attaches `Authorization: Bearer <token>` automatically.

## License

Proprietary / internal project.
