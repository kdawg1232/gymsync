-- GymSync Migration: Photo features
-- Run this in Supabase SQL Editor on an EXISTING database.
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).

-- ═══════════════════════════════════════
-- 1. Grant execute on pair_partners (was missing)
-- ═══════════════════════════════════════
GRANT EXECUTE ON FUNCTION pair_partners(UUID, UUID) TO authenticated;

-- ═══════════════════════════════════════
-- 2. Workout log UPDATE policy (needed for "replace today's entry")
-- ═══════════════════════════════════════
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'workout_logs' AND policyname = 'Users can update their own logs'
  ) THEN
    CREATE POLICY "Users can update their own logs"
      ON workout_logs FOR UPDATE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ═══════════════════════════════════════
-- 3. Storage policies for workout-photos (update + delete)
-- ═══════════════════════════════════════
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Users can update their own workout photos'
  ) THEN
    CREATE POLICY "Users can update their own workout photos"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'workout-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Users can delete their own workout photos'
  ) THEN
    CREATE POLICY "Users can delete their own workout photos"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'workout-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Service role can delete workout photos'
  ) THEN
    CREATE POLICY "Service role can delete workout photos"
      ON storage.objects FOR DELETE TO service_role
      USING (bucket_id = 'workout-photos');
  END IF;
END $$;

-- ═══════════════════════════════════════
-- 4. Auto-cleanup cron for photos older than 7 days
--    Requires pg_cron extension — enable it first in
--    Supabase Dashboard → Database → Extensions → search "pg_cron" → Enable
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
