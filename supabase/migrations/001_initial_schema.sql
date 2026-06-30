-- Sweet Basil EventConnect - Initial Schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('upcoming', 'active', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_action AS ENUM (
    'event_created', 'event_updated', 'event_deleted', 'event_closed',
    'photo_uploaded', 'photo_deleted', 'photo_viewed', 'photo_downloaded',
    'guest_joined', 'user_login', 'user_registered'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  status event_status NOT NULL DEFAULT 'upcoming',
  cover_image TEXT,
  qr_code_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_event ON public.guest_sessions(event_id);

CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_email TEXT,
  guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  photos_uploaded INT NOT NULL DEFAULT 0,
  photos_viewed INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT participant_identity CHECK (
    (user_id IS NOT NULL) OR (guest_name IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_event_user
  ON public.event_participants(event_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_event_guest
  ON public.event_participants(event_id, guest_session_id) WHERE guest_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.event_participants(user_id);

CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE SET NULL,
  uploader_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT photo_uploader CHECK (
    (user_id IS NOT NULL) OR (guest_session_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_photos_event ON public.photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploader ON public.photos(uploader_name);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON public.photos(uploaded_at DESC);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_session_id UUID REFERENCES public.guest_sessions(id) ON DELETE SET NULL,
  action activity_action NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);

-- Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS events_updated ON public.events;
CREATE TRIGGER events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.increment_photos_uploaded()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.event_participants
  SET photos_uploaded = photos_uploaded + 1
  WHERE event_id = NEW.event_id
    AND (
      (NEW.user_id IS NOT NULL AND user_id = NEW.user_id)
      OR (NEW.guest_session_id IS NOT NULL AND guest_session_id = NEW.guest_session_id)
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_photo_uploaded ON public.photos;
CREATE TRIGGER on_photo_uploaded
  AFTER INSERT ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.increment_photos_uploaded();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users read profiles" ON public.profiles;
CREATE POLICY "Users read profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Events policies
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events
  FOR SELECT USING (
    status IN ('active', 'upcoming', 'closed')
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.event_id = events.id AND ep.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage events" ON public.events;
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL USING (public.is_admin());

-- Photos policies
DROP POLICY IF EXISTS "Read photos" ON public.photos;
CREATE POLICY "Read photos" ON public.photos
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = photos.event_id
        AND e.status IN ('active', 'upcoming', 'closed')
    )
  );

DROP POLICY IF EXISTS "Auth upload photos" ON public.photos;
CREATE POLICY "Auth upload photos" ON public.photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.status = 'active'
    )
    AND (user_id = auth.uid() OR public.is_admin())
  );

DROP POLICY IF EXISTS "Delete own photos" ON public.photos;
CREATE POLICY "Delete own photos" ON public.photos
  FOR DELETE USING (public.is_admin() OR user_id = auth.uid());

-- Participants policies
DROP POLICY IF EXISTS "Read participation" ON public.event_participants;
CREATE POLICY "Read participation" ON public.event_participants
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users join events" ON public.event_participants;
CREATE POLICY "Users join events" ON public.event_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Guest sessions - no direct client access
DROP POLICY IF EXISTS "Deny guest sessions" ON public.guest_sessions;
CREATE POLICY "Deny guest sessions" ON public.guest_sessions
  FOR ALL USING (false);

-- Activity logs
DROP POLICY IF EXISTS "Admins read logs" ON public.activity_logs;
CREATE POLICY "Admins read logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Insert logs" ON public.activity_logs;
CREATE POLICY "Insert logs" ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Admin stats view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*)::int FROM public.events) AS total_events,
  (SELECT COUNT(*)::int FROM public.events WHERE status = 'active') AS active_events,
  (SELECT COUNT(*)::int FROM public.profiles WHERE role = 'user') AS registered_users,
  (SELECT COUNT(*)::int FROM public.guest_sessions) AS guest_participants,
  (SELECT COUNT(*)::int FROM public.photos) AS uploaded_photos;
