# GitClone Frontend

Next.js frontend for browsing, searching, and saving GitHub repositories, developed as an assignment for ControlShift

## Tech Stack
- Next.js 16, React 19
- Redux Toolkit + RTK Query
- Tailwind CSS v4
- shadcn/ui + Base UI
- Sonner + Lucide React

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure `.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**3. Start the app**
```bash
npm run dev
```

App runs at `http://localhost:3000`. Ensure the backend is running on port 5000.

## Scripts
- `npm run dev` — Development
- `npm run build` — Production build
- `npm start` — Start production server
- `npm run lint` — Lint code

## Features
- User signup, login, and logout
- Search repositories with language and star filters
- Pagination and debounced search
- Save and remove repositories
- Repository details, commits, and contributors
- Dark and light themes
- Persistent authentication using HTTP-only cookies

## State Management
- **authSlice:** Manages the current user.
- **apiSlice:** Configures RTK Query with `credentials: 'include'`.
- **authApi:** Handles authentication.
- **githubApi:** Handles repository search, details, and saved repositories.
- Tag invalidation automatically refreshes saved repositories after changes.

## Main Routes
- `/login` — User login
- `/signup` — User registration
- `/dashboard` — Search repositories
- `/dashboard/saved` — Saved repositories
- `/dashboard/repo/[owner]/[repo]` — Repository details

## Notes
- Ensure backend CORS allows the frontend origin with credentials.
- GitHub search results are limited to 1,000 per query.
- Use `repoIds` from the saved repositories response to determine which repositories are saved.
- If hydration errors occur, ensure browser-only APIs are accessed after mounting.
