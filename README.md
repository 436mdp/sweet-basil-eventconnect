# Sweet Basil EventConnect

Premium QR-based event photo sharing platform for Sweet Basil Catering.

## Features

- **QR Code Events** — Auto-generated QR codes for guest access
- **Guest Sessions** — No account required; scan, enter name, upload
- **Registered Users** — Email/password and Google OAuth login
- **Admin Dashboard** — Event management, analytics, user management
- **Masonry Gallery** — Pinterest-style photo gallery with infinite scroll
- **Virtual Folders** — Photos grouped by uploader name
- **Secure** — Row Level Security, middleware guards, rate limiting

## Tech Stack

- Next.js 15 · React 19 · TypeScript
- Tailwind CSS · shadcn/ui · Framer Motion
- Supabase (Auth, PostgreSQL, Storage)
- Zustand · React Hook Form · Zod · Sonner
- Vitest · Playwright

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Supabase project

### Installation

```bash
cd ~/Projects/sweet-basil-eventconnect
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase credentials.

### Database Setup

Run migrations in your Supabase SQL Editor (in order):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage.sql`

Or with Supabase CLI:

```bash
npx supabase db push
```

### Create First Admin

After registering your first account:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | ESLint |

## Deployment

See [docs/deployment.md](docs/deployment.md).

## Documentation

- [Installation Guide](docs/installation.md)
- [Deployment Guide](docs/deployment.md)
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api.md)
- [Folder Structure](docs/folder-structure.md)
- [Security](docs/security.md)
- [User Manual](docs/user-manual.md)
- [Admin Manual](docs/admin-manual.md)

## License

Proprietary — Sweet Basil Catering
