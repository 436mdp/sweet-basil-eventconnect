# Security Documentation

## Authentication

### Registered Users
- Supabase Auth with email/password and Google OAuth
- Session managed via HTTP-only cookies (Supabase SSR)
- Middleware refreshes sessions on each request

### Guest Sessions
- HMAC-signed JWT stored in HTTP-only cookie (`sb-guest-session`)
- 7-day expiration
- Scoped to a single event
- Created server-side via service role (guests never get direct DB access)

## Authorization

### Middleware (`src/middleware.ts`)
- Refreshes Supabase auth session
- Protects `/admin/*` — requires auth cookie
- Protects `/dashboard` — requires auth cookie
- Protects `/events/[id]` — requires auth or valid guest cookie

### Server-Side Guards (`src/lib/auth/guards.ts`)
- `getAuthContext()` — resolves user, profile, admin status, guest session
- `requireAuth()` — throws if not authenticated
- `requireAdmin()` — throws if not admin
- `canAccessEvent()` — checks event access rights

### Row Level Security
All tables have RLS enabled. Key policies:
- Admins have full access via `is_admin()` function
- Users can only read/update their own profile
- Photos readable for accessible events; uploads only to active events
- Guest sessions table denies all client access

## Input Validation

All forms and API inputs validated with **Zod** schemas:
- `auth.schema.ts` — login, register, guest join
- `event.schema.ts` — event CRUD
- `photo.schema.ts` — upload metadata

## Rate Limiting

In-memory rate limiting (`src/lib/rate-limit.ts`):
- Guest join: 5 requests/minute per IP
- Photo API: 100 requests/minute per IP

For production at scale, configure Upstash Redis via environment variables.

## File Upload Security

- Allowed MIME types: JPEG, PNG, WEBP
- Maximum file size: 20MB (enforced client and server-side)
- Client-side compression before upload
- Storage path includes event ID and uploader ID
- Supabase Storage bucket has MIME type restrictions

## XSS Protection

- React auto-escapes rendered content
- No `dangerouslySetInnerHTML` used
- User input sanitized via Zod validation

## CSRF Protection

- Next.js Server Actions include built-in CSRF protection
- Cookies use `SameSite=Lax`
- Guest session cookies are `HttpOnly`

## SQL Injection Protection

- All database queries via Supabase client (parameterized)
- No raw SQL in application code
- RLS provides defense in depth

## Secrets Management

| Secret | Exposure |
|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client-safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-safe (RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never in client bundle |
| `GUEST_SESSION_SECRET` | Server only |

## Admin Bootstrap

First admin must be assigned via SQL after registration:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@sweetbasil.com';
```

## Security Checklist for Production

- [ ] All env vars set in Vercel (not committed to git)
- [ ] Service role key never exposed to client
- [ ] Supabase RLS enabled on all tables
- [ ] Google OAuth redirect URLs restricted to your domain
- [ ] Storage bucket policies verified
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Guest session secret is 32+ random characters
- [ ] First admin account created and verified
