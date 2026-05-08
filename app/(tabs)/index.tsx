import { View, Text, RefreshControl, ScrollView, Image } from 'react-native';
import { MotiView } from 'moti';
import { Flame, Dumbbell, UserPlus, User as UserIcon } from 'lucide-react-native';
import { startOfWeek, endOfWeek, addDays, parseISO, isWithinInterval, isSameDay } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { Colors, MoodColors } from '@/constants/colors';
import { useState, useCallback, useMemo } from 'react';
import { getWeeklyStreak } from '@/lib/database';
import { updateWidgetData } from '@/lib/widget';
import { useEffect } from 'react';

function PhotoDayGrid({ logs, userId, accentColor }: {
  logs: { logged_at: string; image_url: string | null; user_id: string; mood: string }[];
  userId: string;
  accentColor: string;
}) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <View className="flex-row gap-1.5 mt-4">
      {days.map((day) => {
        const log = logs.find(
          (l) => l.user_id === userId && isSameDay(parseISO(l.logged_at), day),
        );
        return (
          <View
            key={day.toISOString()}
            className="flex-1 aspect-square rounded-lg overflow-hidden"
            style={{
              backgroundColor: log ? 'transparent' : 'rgba(0,0,0,0.08)',
              borderWidth: log?.mood ? 2 : 0,
              borderColor: log?.mood ? (MoodColors as any)[log.mood] ?? accentColor : 'transparent',
            }}
          >
            {log?.image_url ? (
              <Image
                source={{ uri: log.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : log ? (
              <View className="w-full h-full items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

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

  // Sync widget data with real counts
  useEffect(() => {
    if (!profile || !pact) return;
    const dayOfWeek = new Date().getDay();
    const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    const latestPartnerPhoto = partnerProfile
      ? logs
          .filter((l) => l.user_id === partnerProfile.id && l.image_url)
          .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())[0]
          ?.image_url ?? null
      : null;

    updateWidgetData({
      myCount,
      partnerCount,
      goal: pact.goal,
      myName: profile.name,
      partnerName: partnerProfile?.name ?? 'Partner',
      wager: pact.wager,
      daysLeft,
      streak,
      hasPartner: !!partnerProfile,
      partnerPhotoUrl: latestPartnerPhoto,
      lastUpdated: new Date().toISOString(),
    });
  }, [profile, partnerProfile, pact, myCount, partnerCount, streak, logs]);

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
          <View className="bg-pastel-purple rounded-[32px] p-6 mb-8">
            <View className="flex-row items-center gap-3 mb-4">
              {partnerProfile.avatar_url ? (
                <Image
                  source={{ uri: partnerProfile.avatar_url }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-black/10 items-center justify-center">
                  <UserIcon size={18} color="rgba(0,0,0,0.5)" />
                </View>
              )}
              <Text className="text-2xl font-bold text-black flex-1" numberOfLines={1}>
                {`${partnerName}'s Week`}
              </Text>
            </View>
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

            <PhotoDayGrid
              logs={logs}
              userId={partnerProfile.id}
              accentColor="#000"
            />
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
        <View className="bg-pastel-orange rounded-[32px] p-6 mb-8">
          <View className="flex-row justify-between items-start gap-3 mb-4">
            <View className="flex-row items-center gap-3 flex-1 shrink">
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-black/10 items-center justify-center">
                  <UserIcon size={18} color="rgba(0,0,0,0.5)" />
                </View>
              )}
              <Text className="text-2xl font-bold text-black flex-1 shrink" numberOfLines={1}>Your Progress</Text>
            </View>
            {streak > 0 && (
              <View className="bg-black/10 px-3 py-1 rounded-full flex-row items-center gap-1 shrink-0">
                <Flame size={16} color="#FF5722" fill="#FF5722" />
                <Text className="text-sm font-bold text-black">{streak} wk{streak !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-end gap-3 mb-6">
            <Text className="text-5xl font-black text-black">{myCount}</Text>
            <Text className="text-lg font-medium text-black/60 pb-1">/ {goal} days</Text>
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

          {user && (
            <PhotoDayGrid
              logs={logs}
              userId={user.id}
              accentColor="#000"
            />
          )}
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
