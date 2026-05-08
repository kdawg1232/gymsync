import { View, Text, Pressable, RefreshControl, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Flame, Dumbbell, UserPlus } from 'lucide-react-native';
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { Colors } from '@/constants/colors';
import { useState, useCallback, useMemo } from 'react';
import { getWeeklyStreak } from '@/lib/database';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { user, profile, partnerProfile, pact, goal, wager, myDebt, partnerName } = useApp();
  const { logs, refetch, loading } = useWorkoutLogs(user?.id, partnerProfile?.id);
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const weekInterval = {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };

  const { myCount, partnerCount } = useMemo(() => {
    let my = 0;
    let partner = 0;
    for (const log of logs) {
      const logDate = parseISO(log.logged_at);
      if (isWithinInterval(logDate, weekInterval)) {
        if (log.user_id === user?.id) my++;
        else partner++;
      }
    }
    return { myCount: my, partnerCount: partner };
  }, [logs, user?.id, weekInterval.start.getTime()]);

  useEffect(() => {
    if (user?.id) {
      getWeeklyStreak(user.id, goal).then(setStreak).catch(() => {});
    }
  }, [user?.id, goal, logs.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    if (user?.id) {
      const s = await getWeeklyStreak(user.id, goal).catch(() => 0);
      setStreak(s);
    }
    setRefreshing(false);
  }, [refetch, user?.id, goal]);

  const hasPartner = !!partnerProfile;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-6 pt-16 pb-32"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <View className="pt-4 mb-8">
          <Text className="text-4xl font-bold text-white tracking-tight mb-2">
            Hey{profile?.name ? `, ${profile.name}` : ''}.
          </Text>
          <Text className="text-white/60 text-lg">
            {hasPartner ? `Let's check in on ${partnerName}.` : "Let's get moving."}
          </Text>
        </View>

        {/* Partner Card */}
        {hasPartner ? (
          <View className="bg-pastel-purple rounded-[32px] p-6 mb-8 overflow-hidden relative">
            <View className="relative z-10">
              <Text className="text-2xl font-bold text-black mb-4">{partnerName}'s Week</Text>
              <View className="flex-row items-end gap-3 mb-6">
                <Text className="text-5xl font-black text-black">{partnerCount}</Text>
                <Text className="text-lg font-medium text-black/60 pb-1">/ {goal} days</Text>
              </View>

              <View className="w-full bg-black/10 h-3 rounded-full overflow-hidden">
                <MotiView
                  from={{ width: '0%' }}
                  animate={{
                    width: `${Math.min((partnerCount / goal) * 100, 100)}%`,
                  }}
                  transition={{ type: 'timing', duration: 800 }}
                  className="bg-black h-full rounded-full"
                  style={{ width: '0%' }}
                />
              </View>
            </View>

            <View className="absolute right-[-20px] bottom-[-20px] opacity-20">
              <FaceIcon mood="happy" size={192} color="#000" />
            </View>
          </View>
        ) : (
          <View className="bg-[#1A1A1A] border border-white/10 rounded-[32px] p-6 mb-8 items-center">
            <UserPlus size={40} color={Colors.pastelPurple} style={{ marginBottom: 12 }} />
            <Text className="text-xl font-bold text-white mb-2">No Partner Yet</Text>
            <Text className="text-white/50 text-center text-sm leading-relaxed">
              Share your invite code from the Profile tab to pair up with your accountability partner.
            </Text>
          </View>
        )}

        {/* Your Progress */}
        <View className="bg-pastel-orange rounded-[32px] p-6 mb-8 overflow-hidden relative">
          <View className="relative z-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-black">Your Progress</Text>
              {streak > 0 && (
                <View className="bg-black/10 px-3 py-1 rounded-full flex-row items-center gap-1">
                  <Flame size={16} color="#FF5722" fill="#FF5722" />
                  <Text className="text-sm font-bold text-black">{streak} wk{streak !== 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-end gap-2 mb-4">
              <Text className="text-4xl font-black text-black">{myCount}</Text>
              <Text className="text-sm font-medium text-black/60 pb-1">/ {goal}</Text>
            </View>

            <View className="w-full bg-black/10 h-3 rounded-full overflow-hidden">
              <MotiView
                from={{ width: '0%' }}
                animate={{
                  width: `${Math.min((myCount / goal) * 100, 100)}%`,
                }}
                transition={{ type: 'timing', duration: 800 }}
                className="bg-black h-full rounded-full"
                style={{ width: '0%' }}
              />
            </View>
          </View>
        </View>

        {/* Wager Card */}
        <View className="bg-[#1A1A1A] border border-white/10 rounded-[32px] p-6">
          <View className="flex-row gap-2 items-center mb-1">
            <Dumbbell size={20} color={Colors.pastelPink} />
            <Text className="font-bold text-sm uppercase tracking-wider text-pastel-pink">
              The Stakes
            </Text>
          </View>
          <Text className="text-xl font-medium text-white mt-2">{wager}</Text>
          <Text className="text-white/40 text-sm mt-2">
            {myDebt > 0
              ? `You owe ${partnerName}: ${myDebt}`
              : 'All clear — keep it up!'}
          </Text>
        </View>
      </MotiView>
    </ScrollView>
  );
}
