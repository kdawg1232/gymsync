import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getActivePact } from '@/lib/database';
import type { Pact } from '@/types';

export function usePact(userId: string | undefined) {
  const [pact, setPact] = useState<Pact | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPact = useCallback(async () => {
    if (!userId) return;
    try {
      const p = await getActivePact(userId);
      setPact(p);
    } catch (e) {
      console.error('Error fetching pact:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPact();

    if (!userId) return;

    const channel = supabase
      .channel(`pact-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pacts' },
        (payload) => {
          const row = payload.new as Pact | undefined;
          if (
            row &&
            (row.user1_id === userId || row.user2_id === userId)
          ) {
            fetchPact();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchPact]);

  return { pact, loading, refetch: fetchPact };
}
