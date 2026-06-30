# Deployment Guide

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Sweet Basil EventConnect"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Next.js**

### 3. Environment Variables

Add all variables from `.env.example` in Vercel Project Settings → Environment Variables:

| Variable | Environments |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | Production (`https://your-domain.vercel.app`) |
| `GUEST_SESSION_SECRET` | Production, Preview |

### 4. Deploy

Click **Deploy**. Vercel will run `npm run build` automatically.

### 5. Update Supabase Auth URLs

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**:
  - `https://your-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

### 6. Verify Production

- Visit your Vercel URL
- Test login/register
- Create an event as admin
- Scan QR code on mobile
- Upload a test photo

## Supabase Production Checklist

- [ ] Migrations applied
- [ ] Storage bucket `event-images` created
- [ ] Google OAuth configured with production redirect
- [ ] RLS policies enabled on all tables
- [ ] Service role key stored securely (never in client code)
- [ ] First admin user created

## Custom Domain (Optional)

1. Vercel → Project → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` and Supabase auth URLs

## Monitoring

- Vercel Analytics for performance
- Supabase Dashboard for database metrics
- `/api/health` endpoint for uptime checks
