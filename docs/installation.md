# Installation Guide

## Prerequisites

- **Node.js** 20 or later
- **npm** 10+
- **Supabase** account and project
- **Git** (optional)

## Step 1: Clone or Navigate to Project

```bash
cd ~/Projects/sweet-basil-eventconnect
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure the following variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_APP_URL` | App URL (`http://localhost:3000` for dev) |
| `GUEST_SESSION_SECRET` | Random 32+ char string for guest JWT signing |

Generate a guest session secret:

```bash
openssl rand -base64 32
```

## Step 4: Supabase Setup

### Run Migrations

Execute in Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage.sql`

### Configure Auth

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Enable **Google** OAuth (add Client ID/Secret from Google Cloud Console)
4. Set **Site URL** to `http://localhost:3000`
5. Add redirect URL: `http://localhost:3000/auth/callback`

### Storage Bucket

The migration creates the `event-images` bucket automatically. Verify in **Storage** that it exists and is public for reads.

## Step 5: Create Admin User

1. Start the app: `npm run dev`
2. Register at `/register`
3. In Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Step 6: Verify Installation

```bash
npm run dev
npm run test
```

Visit:
- http://localhost:3000 — Homepage
- http://localhost:3000/admin — Admin dashboard (after admin role assigned)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth redirect fails | Check Site URL and redirect URLs in Supabase |
| Upload fails | Verify storage bucket and RLS policies |
| Guest join fails | Ensure `GUEST_SESSION_SECRET` is set (32+ chars) |
| Admin access denied | Run the admin role SQL update |
