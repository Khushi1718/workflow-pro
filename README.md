# Workflow Pro

A work tracking and activity logging system built with Next.js, React, TypeScript, and MongoDB.

## Quick Start

```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:3000`.

Test credentials:

```text
Admin: admin@tracely.app / password123
Employee: khushi@tracely.app / password123
Employee 2: john@tracely.app / password123
```

## Architecture

- Frontend: Next.js App Router, React, Tailwind CSS, shadcn/Radix UI
- Backend: Next.js route handlers under `app/api`
- Database: MongoDB through Mongoose models in `src/server/models`
- Auth: JWT with role-based access for admin and employee flows

## Project Structure

```text
workflow-pro/
├── app/                  # Next.js routes, layout, health endpoint, API handlers
├── src/
│   ├── views/            # Existing frontend screens, migrated without redesign
│   ├── components/       # Existing UI components
│   ├── lib/              # API client, router compatibility, utilities
│   ├── server/           # Next backend DB, models, JWT, seed script
│   ├── hooks/
│   └── index.css         # Existing design system and global styles
├── public/
├── package.json
└── next.config.mjs
```

## Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run preview  # Start production server after build
npm run seed     # Reset and seed MongoDB test data
npm test         # Run tests
```

## API

The frontend uses the same host by default:

```text
/api/auth/register
/api/auth/login
/api/auth/profile
/api/auth/password
/api/work-logs
/api/work-logs/my-logs
/api/work-logs/:id
/api/admin/users
/api/admin/users/:id
/api/admin/users/:id/status
/api/admin/logs/all
/api/admin/logs/today
/api/admin/activity-logs
```

Health check:

```bash
curl http://localhost:3000/health
```
