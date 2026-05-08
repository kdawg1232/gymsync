import { useState, useEffect, useCallback, useRef } from 'react';
import { startOfWeek } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { getWorkoutLogs } from '@/lib/database';
import type { WorkoutLog } from '@/types';

let channelCounter = 0;

export function useWorkoutLogs(
  userId: string | undefined,
  partnerId: string | null | undefined,
  options?: { currentWeekOnly?: boolean; limit?: number },
) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    try {
      const weekStart = options?.currentWeekOnly
        ? startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()
        : undefined;

      const data = await getWorkoutLogs(userId, partnerId ?? null, {
        weekStart,
        limit: options?.limit,
      });
      setLogs(data);
    } catch (e) {
      if (__DEV__) console.error('Error fetching workout logs:', e);
    } finally {
      setLoading(false);
    }
  }, [userId, partnerId, options?.currentWeekOnly, options?.limit]);

  fetchRef.current = fetchLogs;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchRef.current?.();

    const id = ++channelCounter;
    const channel = supabase
      .channel(`logs-${userId}-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workout_logs' },
        (payload) => {
          const row = payload.new as WorkoutLog;
          if (row.user_id === userId || row.user_id === partnerId) {
            fetchRef.current?.();
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workout_logs' },
        (payload) => {
          const row = payload.new as WorkoutLog;
          if (row.user_id === userId || row.user_id === partnerId) {
            fetchRef.current?.();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, partnerId]);

  return { logs, loading, refetch: fetchLogs };
}
