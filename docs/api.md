# API Documentation

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

## Endpoints

### GET /api/health

Health check endpoint.

**Response:**
```json
{ "status": "ok", "timestamp": "2025-06-22T12:00:00.000Z" }
```

---

### GET /api/photos

Paginated photo list for an event.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| eventId | UUID | Yes | Event ID |
| cursor | string | No | Pagination cursor (uploaded_at) |
| uploader | string | No | Filter by uploader name |
| search | string | No | Search filename/uploader |
| limit | number | No | Page size (default 24, max 50) |

**Response:**
```json
{
  "photos": [...],
  "hasMore": true,
  "nextCursor": "2025-06-22T10:00:00.000Z"
}
```

**Rate Limit:** 100 requests/minute per IP

---

### GET /api/photos/[id]/download

Download a photo file.

**Response:** Binary file with `Content-Disposition: attachment`

---

### GET /api/events/[id]

Get event details.

**Response:**
```json
{ "event": { ... } }
```

---

### PATCH /api/events/[id]

Update event (admin only).

**Body:** Partial event fields

---

### POST /api/guest/join

Create guest session and set cookie.

**Body:**
```json
{
  "guestName": "Jane Doe",
  "guestEmail": "jane@example.com",
  "eventSlug": "abc123xyz"
}
```

**Response:**
```json
{ "success": true, "eventId": "uuid" }
```

**Rate Limit:** 5 requests/minute per IP

---

### GET /api/analytics

Admin dashboard analytics (admin only).

**Response:**
```json
{
  "stats": { "total_events": 5, ... },
  "uploads": [{ "date": "2025-06-22", "count": 12 }],
  "participation": [{ "date": "2025-06-22", "count": 8 }]
}
```

---

## Server Actions

| Action | File | Auth | Description |
|--------|------|------|-------------|
| `login` | auth.ts | Public | Email/password login |
| `register` | auth.ts | Public | Create account |
| `signInWithGoogle` | auth.ts | Public | Google OAuth |
| `signOut` | auth.ts | Auth | Sign out |
| `createEvent` | events.ts | Admin | Create event + QR |
| `updateEvent` | events.ts | Admin | Update event |
| `deleteEvent` | events.ts | Admin | Delete event |
| `closeEvent` | events.ts | Admin | Close event |
| `joinEventAsGuest` | photos.ts | Public | Guest join flow |
| `joinEventAsUser` | photos.ts | Auth | Register user join |
| `uploadPhoto` | photos.ts | Auth/Guest | Upload photo |
| `recordPhotoView` | photos.ts | Auth/Guest | Track view |
| `deletePhoto` | photos.ts | Auth/Admin | Delete photo |

## Auth Callback

### GET /auth/callback

Handles OAuth redirect from Supabase. Exchanges code for session and redirects to `/dashboard`.
