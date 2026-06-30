# Database Schema Documentation

## Overview

Sweet Basil EventConnect uses Supabase PostgreSQL with Row Level Security (RLS).

## Enums

| Enum | Values |
|------|--------|
| `user_role` | `admin`, `user` |
| `event_status` | `upcoming`, `active`, `closed` |
| `activity_action` | `event_created`, `event_updated`, `event_deleted`, `event_closed`, `photo_uploaded`, `photo_deleted`, `photo_viewed`, `photo_downloaded`, `guest_joined`, `user_login`, `user_registered` |

## Tables

### profiles

Extends `auth.users` with application metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | References auth.users |
| email | TEXT | User email |
| name | TEXT | Display name |
| avatar_url | TEXT | Profile photo URL |
| role | user_role | `admin` or `user` |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

### events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Event ID |
| slug | TEXT UNIQUE | Short URL-safe ID for QR codes |
| name | TEXT | Event name |
| description | TEXT | Event description |
| venue | TEXT | Event location |
| event_date | TIMESTAMPTZ | Event date/time |
| status | event_status | `upcoming`, `active`, `closed` |
| cover_image | TEXT | Cover image URL |
| qr_code_url | TEXT | Generated QR code data URL |
| created_by | UUID FK | Admin who created event |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

### guest_sessions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Session ID |
| event_id | UUID FK | Associated event |
| guest_name | TEXT | Guest display name |
| guest_email | TEXT | Optional email |
| session_token | TEXT UNIQUE | Internal token |
| expires_at | TIMESTAMPTZ | Session expiry (7 days) |
| created_at | TIMESTAMPTZ | Creation timestamp |

### event_participants

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Participant ID |
| event_id | UUID FK | Event |
| user_id | UUID FK | Registered user (nullable) |
| guest_name | TEXT | Guest name (nullable) |
| guest_email | TEXT | Guest email (nullable) |
| guest_session_id | UUID FK | Guest session (nullable) |
| photos_uploaded | INT | Upload count |
| photos_viewed | INT | View count |
| joined_at | TIMESTAMPTZ | Join timestamp |

### photos

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Photo ID |
| event_id | UUID FK | Event |
| user_id | UUID FK | Uploader (registered) |
| guest_session_id | UUID FK | Uploader (guest) |
| uploader_name | TEXT | Display name |
| file_name | TEXT | Original filename |
| storage_path | TEXT UNIQUE | Supabase Storage path |
| file_url | TEXT | Public URL |
| file_size | BIGINT | Size in bytes |
| mime_type | TEXT | MIME type |
| uploaded_at | TIMESTAMPTZ | Upload timestamp |

### activity_logs

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Log ID |
| user_id | UUID FK | User (nullable) |
| guest_session_id | UUID FK | Guest (nullable) |
| action | activity_action | Action type |
| resource_type | TEXT | Resource category |
| resource_id | UUID | Resource ID |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMPTZ | Timestamp |

## Storage

**Bucket:** `event-images` (public read)

**Path pattern:** `{eventId}/{userId|guestSessionId}/{uuid}-{filename}`

## Views

### admin_stats

Aggregated dashboard statistics: total events, active events, registered users, guest participants, uploaded photos.

## Triggers

- `on_auth_user_created` — Auto-creates profile on signup
- `on_photo_uploaded` — Increments participant upload count
- `profiles_updated` / `events_updated` — Auto-updates `updated_at`

## RLS Summary

| Table | Public Read | Auth Write | Admin Full |
|-------|------------|------------|------------|
| profiles | Own + admin | Own update | Yes |
| events | Active/upcoming/closed | No | Yes |
| photos | Event photos | Own upload | Delete |
| guest_sessions | Denied | Denied | Service role only |
| event_participants | Own + admin | Own join | Yes |
| activity_logs | Admin read | Insert own | Yes |
