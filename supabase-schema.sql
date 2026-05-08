-- GymSync Database Schema
-- Run this in your Supabase SQL Editor to set up all tables and policies.

-- ═══════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  partner_id UUID REFERENCES profiles(id),
  notification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal INT NOT NULL DEFAULT 3 CHECK (goal BETWEEN 1 AND 7),
  wager TEXT NOT NULL DEFAULT '1 Coffee',
  user1_debt INT NOT NULL DEFAULT 0,
  user2_debt INT NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pact_id UUID REFERENCES pacts(id) ON DELETE SET NULL,
  image_url TEXT,
  caption TEXT,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'tired', 'pumped', 'dead')),
  logged_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  workout_reminders BOOLEAN DEFAULT true,
  partner_activity BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00'
);

-- ═══════════════════════════════════════
-- TABLE PERMISSIONS
-- ═══════════════════════════════════════

GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE profiles TO service_role;
GRANT ALL ON TABLE pacts TO authenticated;
GRANT ALL ON TABLE pacts TO service_role;
GRANT ALL ON TABLE workout_logs TO authenticated;
GRANT ALL ON TABLE workout_logs TO service_role;
GRANT ALL ON TABLE notification_preferences TO authenticated;
GRANT ALL ON TABLE notification_preferences TO service_role;

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, but only update their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Pacts: participants can view and update their pacts
CREATE POLICY "Pact participants can view pacts"
  ON pacts FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Authenticated users can create pacts"
  ON pacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Pact participants can update pacts"
  ON pacts FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Workout logs: users can view their own and their partner's logs
CREATE POLICY "Users can view own and partner logs"
  ON workout_logs FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT partner_id FROM profiles WHERE id = auth.uid() AND partner_id IS NOT NULL
    )
  );

CREATE POLICY "Users can insert their own logs"
  ON workout_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notification preferences: users can only access their own
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- RPC FUNCTIONS
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION pair_partners(p_my_id UUID, p_partner_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_my_id = p_partner_id THEN
    RAISE EXCEPTION 'Cannot pair with yourself';
  END IF;

  UPDATE profiles SET partner_id = p_partner_id WHERE id = p_my_id;
  UPDATE profiles SET partner_id = p_my_id WHERE id = p_partner_id;
END;
$$;

-- Clears partner link for both users and ends active pacts between them.
CREATE OR REPLACE FUNCTION unpair_partners(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  SELECT partner_id INTO v_partner_id FROM profiles WHERE id = p_user_id;
  UPDATE profiles SET partner_id = NULL WHERE id = p_user_id;
  IF v_partner_id IS NOT NULL THEN
    UPDATE profiles SET partner_id = NULL WHERE id = v_partner_id;
  END IF;
  UPDATE pacts SET active = false
  WHERE active = true
    AND (user1_id = p_user_id OR user2_id = p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION pair_partners(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unpair_partners(UUID) TO authenticated;

-- ═══════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('workout-photos', 'workout-photos', true);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Workout photos are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'workout-photos');

CREATE POLICY "Users can upload their own workout photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'workout-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own workout photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'workout-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own workout photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'workout-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Service role can delete workout photos"
  ON storage.objects FOR DELETE TO service_role
  USING (bucket_id = 'workout-photos');

-- ═══════════════════════════════════════
-- WORKOUT LOG UPDATE POLICY
-- ═══════════════════════════════════════

CREATE POLICY "Users can update their own logs"
  ON workout_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- AUTO-CLEANUP: Delete workout photos older than 7 days
-- Requires pg_cron extension (enable in Supabase Dashboard → Database → Extensions)
-- ═══════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION cleanup_old_workout_photos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'workout-photos'
    AND created_at < NOW() - INTERVAL '7 days';

  UPDATE workout_logs
  SET image_url = NULL
  WHERE image_url IS NOT NULL
    AND logged_at < NOW() - INTERVAL '7 days';
END;
$$;

SELECT cron.schedule(
  'cleanup-workout-photos',
  '0 3 * * *',
  'SELECT cleanup_old_workout_photos()'
);

-- ═══════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE pacts;
ALTER PUBLICATION supabase_realtime ADD TABLE workout_logs;
