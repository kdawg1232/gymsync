-- GymSync Migration: Security Fixes
-- Run this in Supabase SQL Editor on an EXISTING database.
-- Safe to run multiple times (uses CREATE OR REPLACE / IF NOT EXISTS / DROP IF EXISTS).

-- ═══════════════════════════════════════
-- B1: Add auth.uid() check to pair_partners()
-- Prevents any user from forcibly pairing arbitrary accounts.
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION pair_partners(p_my_id UUID, p_partner_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_my_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_my_id = p_partner_id THEN
    RAISE EXCEPTION 'Cannot pair with yourself';
  END IF;

  UPDATE profiles SET partner_id = p_partner_id WHERE id = p_my_id;
  UPDATE profiles SET partner_id = p_my_id WHERE id = p_partner_id;
END;
$$;

-- ═══════════════════════════════════════
-- B2: Add auth.uid() check to unpair_partners()
-- Prevents any user from breaking another user's partnership.
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION unpair_partners(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

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

-- ═══════════════════════════════════════
-- B3: Add missing DELETE policy on workout_logs
-- ═══════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'workout_logs' AND policyname = 'Users can delete their own logs'
  ) THEN
    CREATE POLICY "Users can delete their own logs"
      ON workout_logs FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ═══════════════════════════════════════
-- B5: Add missing DELETE policy on avatars storage
-- ═══════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Users can delete their own avatar'
  ) THEN
    CREATE POLICY "Users can delete their own avatar"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- ═══════════════════════════════════════
-- B6: Tighten pact INSERT policy
-- Only allow creating a pact when both users are already partners.
-- ═══════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can create pacts" ON pacts;

CREATE POLICY "Authenticated users can create pacts"
  ON pacts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user1_id
    AND (
      user1_id = user2_id
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND partner_id = user2_id
      )
    )
  );

-- ═══════════════════════════════════════
-- B9: Add indexes on frequently queried columns
-- ═══════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_logged_at ON workout_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_pacts_active ON pacts(active);
CREATE INDEX IF NOT EXISTS idx_wager_ledger_debtor_id ON wager_ledger(debtor_id);
CREATE INDEX IF NOT EXISTS idx_wager_ledger_status ON wager_ledger(status);
