-- Adds settings actions for deleting a user's app data or deleting the account.
-- Run this in the Supabase SQL Editor for existing projects.

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

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  PERFORM public.clear_user_data();

  DELETE FROM auth.users
  WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION clear_user_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION clear_user_data() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
