export type UserRole = "admin" | "user";
export type EventStatus = "upcoming" | "active" | "closed";

export type ActivityAction =
  | "event_created"
  | "event_updated"
  | "event_deleted"
  | "event_closed"
  | "photo_uploaded"
  | "photo_deleted"
  | "photo_viewed"
  | "photo_downloaded"
  | "guest_joined"
  | "user_login"
  | "user_registered";

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  venue: string | null;
  event_date: string;
  status: EventStatus;
  cover_image: string | null;
  qr_code_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_session_id: string | null;
  photos_uploaded: number;
  photos_viewed: number;
  joined_at: string;
  events?: Event;
}

export interface Photo {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_session_id: string | null;
  uploader_name: string;
  file_name: string;
  storage_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface GuestSession {
  id: string;
  event_id: string;
  guest_name: string;
  guest_email: string | null;
  session_token: string;
  expires_at: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  action: ActivityAction;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AdminStats {
  total_events: number;
  active_events: number;
  registered_users: number;
  guest_participants: number;
  uploaded_photos: number;
}

export interface UploaderFolder {
  uploader_name: string;
  photo_count: number;
  latest_upload: string;
}

export interface GuestSessionPayload {
  guestSessionId: string;
  eventId: string;
  guestName: string;
  exp: number;
}

export interface AuthContext {
  userId: string | null;
  profile: Profile | null;
  isAdmin: boolean;
  guestSession: GuestSessionPayload | null;
}
