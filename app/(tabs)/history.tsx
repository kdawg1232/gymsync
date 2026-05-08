import { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, RefreshControl, Pressable, Modal, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { startOfWeek, addDays, isSameDay, format, parseISO, subDays } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { cn } from '@/lib/utils';
import { Colors, MoodColors } from '@/constants/colors';
import { Calendar, X, User as UserIcon } from 'lucide-react-native';
import type { WorkoutLog, Mood } from '@/types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const BEREAL_CELL_SIZE = (SCREEN_WIDTH - 48 - 36) / 7; // padding 48, gaps 36 (6*6)

function BeRealPhotoCell({
  userLog,
  partnerLog,
  dayLabel,
  onPress,
}: {
  userLog: WorkoutLog | undefined;
  partnerLog: WorkoutLog | undefined;
  dayLabel: string;
  onPress: (log: WorkoutLog) => void;
}) {
  const cellSize = BEREAL_CELL_SIZE;
  const smallSize = cellSize * 0.38;

  return (
    <View style={{ width: cellSize, alignItems: 'center' }}>
      <View
        style={{
          width: cellSize,
          height: cellSize * 1.3,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
        }}
      >
        {/* Main photo (user) */}
        <Pressable
          onPress={() => userLog && onPress(userLog)}
          style={{ flex: 1 }}
          disabled={!userLog?.image_url}
        >
          {userLog?.image_url ? (
            <Image
              source={{ uri: userLog.image_url }}
              style={{
                width: '100%',
                height: '100%',
                borderWidth: 2,
                borderColor: MoodColors[userLog.mood as Mood] ?? Colors.pastelGreen,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          ) : userLog ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: MoodColors[userLog.mood as Mood] ?? Colors.pastelGreen,
                borderRadius: 8,
              }}
            >
              <FaceIcon mood={userLog.mood} size={16} color={MoodColors[userLog.mood as Mood]} />
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </View>
          )}
        </Pressable>

        {/* Small overlay photo (partner) — BeReal style */}
        {partnerLog && (
          <Pressable
            onPress={() => onPress(partnerLog)}
            style={{
              position: 'absolute',
              top: 3,
              left: 3,
              width: smallSize,
              height: smallSize,
              borderRadius: 4,
              overflow: 'hidden',
              borderWidth: 1.5,
              borderColor: MoodColors[partnerLog.mood as Mood] ?? Colors.pastelPurple,
              backgroundColor: '#1A1A1A',
            }}
            disabled={!partnerLog.image_url}
          >
            {partnerLog.image_url ? (
              <Image
                source={{ uri: partnerLog.image_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <FaceIcon mood={partnerLog.mood} size={8} color={MoodColors[partnerLog.mood as Mood]} />
              </View>
            )}
          </Pressable>
        )}
      </View>
      <Text className="text-white/30 text-[10px] font-bold mt-1">{dayLabel}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { user, partnerProfile, partnerName, profile } = useApp();
  const { logs, refetch, loading } = useWorkoutLogs(user?.id, partnerProfile?.id, { limit: 30 });
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLog, setExpandedLog] = useState<WorkoutLog | null>(null);

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

  const getLogForDay = useCallback(
    (userId: string, date: Date) =>
      logs.find(
        (l) => l.user_id === userId && isSameDay(parseISO(l.logged_at), date),
      ),
    [logs],
  );

  const last7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
  }, []);

  const last7DayLabels = useMemo(
    () => last7Days.map((d) => format(d, 'EEE').charAt(0)),
    [last7Days],
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
    <View className="flex-1">
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
          <View className="bg-[#1A1A1A] p-5 rounded-3xl mb-6">
            <Text className="text-white/60 font-bold text-sm tracking-wide uppercase mb-6">
              This Week
            </Text>

            <View className="gap-5">
              {/* Partner Row */}
              {hasPartner && (
                <View className="gap-2">
                  <Text className="text-white/40 font-medium leading-snug">{partnerName}</Text>
                  <View className="flex-row justify-between relative">
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
              <View className="gap-2">
                <Text className="text-white/40 font-medium leading-snug">You</Text>
                <View className="flex-row justify-between relative">
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
              <View className="flex-row justify-between pt-2">
                {DAY_LABELS.map((l, i) => (
                  <Text key={i} className="text-white/30 text-xs font-bold w-6 text-center">
                    {l}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* BeReal-Style Photo Grid */}
          <View className="bg-[#1A1A1A] p-4 rounded-3xl mb-8">
            <Text className="text-white/60 font-bold text-sm tracking-wide uppercase mb-4">
              Last 7 Days
            </Text>
            <View className="flex-row justify-between">
              {last7Days.map((day, i) => (
                <BeRealPhotoCell
                  key={day.toISOString()}
                  userLog={user ? getLogForDay(user.id, day) : undefined}
                  partnerLog={partnerProfile ? getLogForDay(partnerProfile.id, day) : undefined}
                  dayLabel={last7DayLabels[i]}
                  onPress={setExpandedLog}
                />
              ))}
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

          {/* Workout Grid */}
          <View className="flex-row flex-wrap gap-3 pb-8">
            {sortedLogs.map((log) => {
              const isMe = log.user_id === user?.id;
              const displayName = isMe ? (profile?.name ?? 'Me') : partnerName;

              return (
                <Pressable
                  key={log.id}
                  className="w-[47%] aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A1A1A]"
                  onPress={() => log.image_url ? setExpandedLog(log) : undefined}
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
                </Pressable>
              );
            })}
          </View>
        </MotiView>
      </ScrollView>

      {/* Photo Expand Modal */}
      <Modal
        visible={!!expandedLog}
        transparent
        animationType="fade"
        onRequestClose={() => setExpandedLog(null)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center">
          <Pressable
            onPress={() => setExpandedLog(null)}
            className="absolute top-16 right-6 z-10 p-3 bg-white/10 rounded-full"
          >
            <X size={24} color="#fff" />
          </Pressable>

          {expandedLog && (
            <View className="w-full px-6 items-center">
              {expandedLog.image_url ? (
                <Image
                  source={{ uri: expandedLog.image_url }}
                  style={{
                    width: SCREEN_WIDTH - 48,
                    height: SCREEN_WIDTH - 48,
                    borderRadius: 24,
                    borderWidth: 3,
                    borderColor: MoodColors[expandedLog.mood as Mood] ?? Colors.pastelGreen,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: SCREEN_WIDTH - 48,
                    height: SCREEN_WIDTH - 48,
                    borderRadius: 24,
                    borderWidth: 3,
                    borderColor: MoodColors[expandedLog.mood as Mood] ?? Colors.pastelGreen,
                    backgroundColor: '#1A1A1A',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaceIcon mood={expandedLog.mood} size={80} color={MoodColors[expandedLog.mood as Mood]} />
                </View>
              )}

              <View className="mt-4 items-center">
                <View className="flex-row items-center gap-2 mb-1">
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: MoodColors[expandedLog.mood as Mood] + '30' }}
                  >
                    <Text
                      className="font-bold text-sm capitalize"
                      style={{ color: MoodColors[expandedLog.mood as Mood] }}
                    >
                      {expandedLog.mood}
                    </Text>
                  </View>
                </View>
                <Text className="text-white/60 text-sm mt-1">
                  {format(parseISO(expandedLog.logged_at), 'EEEE, MMM d · h:mm a')}
                </Text>
                {expandedLog.caption && (
                  <Text className="text-white/80 text-base italic mt-3 text-center">
                    "{expandedLog.caption}"
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
