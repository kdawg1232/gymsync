import { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, RefreshControl } from 'react-native';
import { MotiView } from 'moti';
import { startOfWeek, addDays, isSameDay, format, parseISO } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { cn } from '@/lib/utils';
import { Colors } from '@/constants/colors';
import { Calendar } from 'lucide-react-native';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HistoryScreen() {
  const { user, partnerProfile, partnerName, profile } = useApp();
  const { logs, refetch, loading } = useWorkoutLogs(user?.id, partnerProfile?.id, { limit: 14 });
  const [refreshing, setRefreshing] = useState(false);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const hasLog = useCallback(
    (userId: string, date: Date) =>
      logs.some(
        (l) =>
          l.user_id === userId && isSameDay(parseISO(l.logged_at), date),
      ),
    [logs],
  );

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
      ),
    [logs],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const hasPartner = !!partnerProfile;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-6 pt-20 pb-32"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      <MotiView
        from={{ opacity: 0, translateX: 20 }}
        animate={{ opacity: 1, translateX: 0 }}
      >
        <Text className="text-3xl font-bold text-pastel-yellow mb-6">History</Text>

        {/* Week Tracker */}
        <View className="bg-[#1A1A1A] p-5 rounded-3xl mb-8">
          <Text className="text-white/60 font-bold text-sm tracking-wide uppercase mb-6">
            This Week
          </Text>

          <View className="gap-5">
            {/* Partner Row */}
            {hasPartner && (
              <View className="flex-row items-center gap-4">
                <Text className="text-white/40 font-medium w-12" numberOfLines={1}>
                  {partnerName.split(' ')[0]}
                </Text>
                <View className="flex-1 flex-row justify-between relative">
                  <View className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2" />
                  {days.map((d) => (
                    <View
                      key={d.toString()}
                      className={cn(
                        'w-6 h-6 rounded-full border-4 z-10',
                        hasLog(partnerProfile!.id, d)
                          ? 'bg-pastel-purple border-pastel-purple'
                          : 'bg-[#1A1A1A] border-white/5'
                      )}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* My Row */}
            <View className="flex-row items-center gap-4">
              <Text className="text-white/40 font-medium w-12">You</Text>
              <View className="flex-1 flex-row justify-between relative">
                <View className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2" />
                {days.map((d) => (
                  <View
                    key={d.toString()}
                    className={cn(
                      'w-6 h-6 rounded-full border-4 z-10',
                      user && hasLog(user.id, d)
                        ? 'bg-pastel-green border-pastel-green'
                        : 'bg-[#1A1A1A] border-white/5'
                    )}
                  />
                ))}
              </View>
            </View>

            {/* Day Labels */}
            <View className="flex-row items-center gap-4 pt-2">
              <View className="w-12" />
              <View className="flex-1 flex-row justify-between">
                {DAY_LABELS.map((l, i) => (
                  <Text key={i} className="text-white/30 text-xs font-bold w-6 text-center">
                    {l}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <Text className="text-xl font-bold text-white mb-4">Past Workouts</Text>

        {/* Empty State */}
        {sortedLogs.length === 0 && !loading && (
          <View className="bg-[#1A1A1A] rounded-3xl p-8 items-center">
            <Calendar size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: 12 }} />
            <Text className="text-white/40 font-bold text-center">No workouts yet</Text>
            <Text className="text-white/20 text-sm text-center mt-1">
              Log your first workout to see it here.
            </Text>
          </View>
        )}

        {/* Workout Grid - Last 7 days */}
        <View className="flex-row flex-wrap gap-3 pb-8">
          {sortedLogs.map((log) => {
            const isMe = log.user_id === user?.id;
            const displayName = isMe ? (profile?.name ?? 'Me') : partnerName;

            return (
              <View
                key={log.id}
                className="w-[47%] aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A1A1A]"
              >
                {log.image_url ? (
                  <Image
                    source={{ uri: log.image_url }}
                    className="w-full h-full absolute"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full absolute bg-[#1A1A1A] items-center justify-center">
                    <FaceIcon
                      mood={log.mood}
                      size={48}
                      color="rgba(255,255,255,0.15)"
                    />
                  </View>
                )}
                <View className="absolute inset-0 bg-black/30" />
                <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

                <View className="absolute bottom-3 left-3 right-3">
                  <Text className="text-white font-bold leading-none">{displayName}</Text>
                  <Text className="text-white/60 text-xs font-medium">
                    {format(parseISO(log.logged_at), 'MMM d')}
                  </Text>
                </View>

                <View className="absolute top-3 left-3 bg-black/40 p-1.5 rounded-full border border-white/10">
                  <FaceIcon
                    mood={log.mood}
                    size={16}
                    color={isMe ? Colors.pastelGreen : Colors.pastelPurple}
                  />
                </View>

                {log.caption ? (
                  <View className="absolute top-3 right-3 bg-black/40 px-2 py-1 rounded-lg border border-white/10 max-w-[100px]">
                    <Text className="text-[10px] text-white italic" numberOfLines={1}>
                      "{log.caption}"
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </MotiView>
    </ScrollView>
  );
}
