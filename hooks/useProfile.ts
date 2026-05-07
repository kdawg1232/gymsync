import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/database';
import type { Profile } from '@/types';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const p = await getProfile(userId);
      setProfile(p);

      if (p?.partner_id) {
        const partner = await getProfile(p.partner_id);
        setPartnerProfile(partner);
      } else {
        setPartnerProfile(null);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();

    if (!userId) return;

    const channel = supabase
      .channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        () => fetchProfile(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchProfile]);

  return { profile, partnerProfile, loading, refetch: fetchProfile };
}
