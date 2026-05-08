-- GymSync Migration: Wager Ledger
-- Replaces simple integer debt counters with a full ledger tracking individual penalties.
-- Run this in your Supabase SQL Editor after the base schema is in place.

-- ═══════════════════════════════════════
-- NEW TABLE: wager_ledger
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS wager_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pact_id UUID NOT NULL REFERENCES pacts(id) ON DELETE CASCADE,
  debtor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creditor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  penalty_text TEXT NOT NULL,
  week_start DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'deferred')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- PERMISSIONS
-- ═══════════════════════════════════════

GRANT ALL ON TABLE wager_ledger TO authenticated;
GRANT ALL ON TABLE wager_ledger TO service_role;

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE wager_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ledger entries visible to debtor and creditor"
  ON wager_ledger FOR SELECT TO authenticated
  USING (auth.uid() = debtor_id OR auth.uid() = creditor_id);

CREATE POLICY "Authenticated users can create ledger entries"
  ON wager_ledger FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creditor_id OR auth.uid() = debtor_id);

CREATE POLICY "Creditor can update ledger entries"
  ON wager_ledger FOR UPDATE TO authenticated
  USING (auth.uid() = creditor_id);

CREATE POLICY "Participants can delete ledger entries"
  ON wager_ledger FOR DELETE TO authenticated
  USING (auth.uid() = debtor_id OR auth.uid() = creditor_id);

-- ═══════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE wager_ledger;

-- ═══════════════════════════════════════
-- MIGRATE EXISTING DEBT COUNTERS
-- Creates "legacy" pending ledger entries from the current
-- user1_debt / user2_debt integer values on active pacts.
-- ═══════════════════════════════════════

INSERT INTO wager_ledger (pact_id, debtor_id, creditor_id, penalty_text, week_start, status)
SELECT
  p.id,
  p.user1_id,
  p.user2_id,
  p.wager,
  (date_trunc('week', now()))::date,
  'pending'
FROM pacts p, generate_series(1, p.user1_debt) AS s
WHERE p.active = true AND p.user1_debt > 0;

INSERT INTO wager_ledger (pact_id, debtor_id, creditor_id, penalty_text, week_start, status)
SELECT
  p.id,
  p.user2_id,
  p.user1_id,
  p.wager,
  (date_trunc('week', now()))::date,
  'pending'
FROM pacts p, generate_series(1, p.user2_debt) AS s
WHERE p.active = true AND p.user2_debt > 0;

-- ═══════════════════════════════════════
-- UPDATE clear_user_data TO HANDLE LEDGER
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION clear_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_partner_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT partner_id INTO v_partner_id
  FROM public.profiles
  WHERE id = v_user_id;

  UPDATE public.profiles
  SET partner_id = NULL
  WHERE id = v_user_id;

  IF v_partner_id IS NOT NULL THEN
    UPDATE public.profiles
    SET partner_id = NULL
    WHERE id = v_partner_id
      AND partner_id = v_user_id;
  END IF;

  DELETE FROM public.wager_ledger
  WHERE debtor_id = v_user_id OR creditor_id = v_user_id;

  DELETE FROM public.pacts
  WHERE user1_id = v_user_id OR user2_id = v_user_id;

  DELETE FROM public.workout_logs
  WHERE user_id = v_user_id;

  DELETE FROM public.notification_preferences
  WHERE user_id = v_user_id;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (v_user_id);

  DELETE FROM storage.objects
  WHERE bucket_id IN ('avatars', 'workout-photos')
    AND (storage.foldername(name))[1] = v_user_id::text;

  UPDATE public.profiles
  SET avatar_url = NULL,
      notification_token = NULL
  WHERE id = v_user_id;
END;
$$;
