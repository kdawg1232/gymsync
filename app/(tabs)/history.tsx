import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  Dimensions,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {
  startOfWeek,
  addDays,
  isSameDay,
  format,
  parseISO,
  subDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  addMonths,
  subMonths,
} from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { getWorkoutLogs } from '@/lib/database';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { cn } from '@/lib/utils';
import { Colors, MoodColors } from '@/constants/colors';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { WorkoutLog, Mood } from '@/types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SCREEN_WIDTH = Dimensions.get('window').width;

/** Horizontal padding of History ScrollView (Tailwind p-6 ≈ 24px each side). */
const SCROLL_H_PAD = 24 * 2;

function PhotoDayCell({
  log,
  dayLabel,
  onPress,
  cellSize,
  accentColor,
}: {
  log: WorkoutLog | undefined;
  dayLabel: string;
  onPress: (log: WorkoutLog) => void;
  cellSize: number;
  accentColor: string;
}) {
  const cellH = cellSize * 1.3;

  return (
    <View style={{ width: cellSize, alignItems: 'center' }}>
      <Pressable
        onPress={() => log && onPress(log)}
        disabled={!log?.image_url}
        style={{
          width: cellSize,
          height: cellH,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
        }}
      >
        {log?.image_url ? (
          <View
            style={{
              width: cellSize,
              height: cellH,
              borderWidth: 2,
              borderColor: MoodColors[log.mood as Mood] ?? accentColor,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: log.image_url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        ) : log ? (
          <View
            style={{
              width: cellSize,
              height: cellH,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: MoodColors[log.mood as Mood] ?? accentColor,
              borderRadius: 8,
            }}
          >
            <FaceIcon mood={log.mood} size={16} color={MoodColors[log.mood as Mood]} />
          </View>
        ) : (
          <View
            style={{
              width: cellSize,
              height: cellH,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </View>
        )}
      </Pressable>
      <Text className="text-white/30 text-[10px] font-bold mt-1">{dayLabel}</Text>
    </View>
  );
}

function hasPhotoLogForDay(
  logs: WorkoutLog[],
  userId: string,
  date: Date,
): boolean {
  return logs.some(
    (l) =>
      l.user_id === userId &&
      !!l.image_url &&
      isSameDay(parseISO(l.logged_at), date),
  );
}

function monthCalendarDays(month: Date): Date[] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const gridStart = startOfWeek(first, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(last, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export default function HistoryScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const { user, partnerProfile, partnerName } = useApp();
  const { logs, refetch } = useWorkoutLogs(user?.id, partnerProfile?.id, { limit: 80 });
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLog, setExpandedLog] = useState<WorkoutLog | null>(null);

  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [monthLogs, setMonthLogs] = useState<WorkoutLog[]>([]);
  const [monthFetching, setMonthFetching] = useState(false);
  const monthFetchGen = useRef(0);

  /** Photo card: ScrollView p-6 + inner card p-4 + 6 gaps between 7 cells. */
  const berealCardPad = 16 * 2;
  const berealGap = 6;
  const berealInnerWidth = windowWidth - SCROLL_H_PAD - berealCardPad;
  const berealCellSize = Math.max(
    36,
    Math.floor((berealInnerWidth - berealGap * 6) / 7),
  );

  /** Calendar card: ScrollView p-6 + card p-5 + 6 gaps. */
  const calCardPad = 20 * 2;
  const calGap = 4;
  const calInnerWidth = windowWidth - SCROLL_H_PAD - calCardPad;
  const calCellSize = Math.max(
    28,
    Math.floor((calInnerWidth - calGap * 6) / 7),
  );

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const hasLog = useCallback(
    (userId: string, date: Date) =>
      logs.some(
        (l) =>
          l.user_id === userId &&
          !!l.image_url &&
          isSameDay(parseISO(l.logged_at), date),
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

  useEffect(() => {
    if (!user?.id) {
      setMonthLogs([]);
      setMonthFetching(false);
      return;
    }
    const gen = ++monthFetchGen.current;
    setMonthFetching(true);
    setMonthLogs([]);
    const start = startOfMonth(calendarMonth);
    const endExclusive = addMonths(start, 1);
    getWorkoutLogs(user.id, partnerProfile?.id ?? null, {
      from: start.toISOString(),
      to: endExclusive.toISOString(),
    })
      .then((data) => {
        if (monthFetchGen.current === gen) setMonthLogs(data);
      })
      .catch(() => {
        if (monthFetchGen.current === gen) setMonthLogs([]);
      })
      .finally(() => {
        if (monthFetchGen.current === gen) setMonthFetching(false);
      });
  }, [user?.id, partnerProfile?.id, calendarMonth]);

  const calendarGridDays = useMemo(() => monthCalendarDays(calendarMonth), [calendarMonth]);

  const calendarWeekRows = useMemo(() => {
    const days = calendarGridDays;
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [calendarGridDays]);

  const getDayCalendarKind = useCallback(
    (date: Date): 'both' | 'me' | 'partner' | 'empty' | 'outside' => {
      const inMonth = isSameMonth(date, calendarMonth);
      if (!inMonth) return 'outside';
      const me = user ? hasPhotoLogForDay(monthLogs, user.id, date) : false;
      const partner = partnerProfile
        ? hasPhotoLogForDay(monthLogs, partnerProfile.id, date)
        : false;
      if (me && partner) return 'both';
      if (me) return 'me';
      if (partner) return 'partner';
      return 'empty';
    },
    [calendarMonth, monthLogs, user, partnerProfile],
  );

  const canGoNextMonth = isBefore(startOfMonth(calendarMonth), startOfMonth(new Date()));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    if (user?.id) {
      const start = startOfMonth(calendarMonth);
      const endExclusive = addMonths(start, 1);
      const data = await getWorkoutLogs(user.id, partnerProfile?.id ?? null, {
        from: start.toISOString(),
        to: endExclusive.toISOString(),
      }).catch(() => []);
      setMonthLogs(data);
    }
    setRefreshing(false);
  }, [refetch, user?.id, partnerProfile?.id, calendarMonth]);

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
        <View>
          <Text className="text-3xl font-bold text-pastel-yellow mb-6">History</Text>

          {/* Week Tracker */}
          <View className="bg-[#1A1A1A] p-5 rounded-3xl mb-6">
            <Text className="text-white/60 font-bold text-sm tracking-wide uppercase mb-6">
              This Week
            </Text>

            <View className="gap-5">
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
                            : 'bg-[#1A1A1A] border-white/5',
                        )}
                      />
                    ))}
                  </View>
                </View>
              )}

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
                          : 'bg-[#1A1A1A] border-white/5',
                      )}
                    />
                  ))}
                </View>
              </View>

              <View className="flex-row justify-between pt-2">
                {DAY_LABELS.map((l, i) => (
                  <Text key={i} className="text-white/30 text-xs font-bold w-6 text-center">
                    {l}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Photo Grids — you + partner */}
          <View className="bg-[#1A1A1A] p-4 rounded-3xl mb-4 gap-5 overflow-hidden">
            <View>
              <Text className="text-white/60 font-bold text-sm tracking-wide uppercase mb-3">
                You · Last 7 Days
              </Text>
              <View
                className="flex-row items-start"
                style={{ width: berealInnerWidth, gap: berealGap, alignSelf: 'center' }}
              >
                {last7Days.map((day, i) => (
                  <PhotoDayCell
                    key={`me-${day.toISOString()}`}
                    cellSize={berealCellSize}
                    log={user ? getLogForDay(user.id, day) : undefined}
                    accentColor={Colors.pastelGreen}
                    dayLabel={last7DayLabels[i]}
                    onPress={setExpandedLog}
                  />
                ))}
              </View>
            </View>

            {hasPartner && (
              <View className="pt-4 border-t border-white/10">
                <Text className="text-white/60 font-bold text-sm tracking-wide uppercase mb-3">
                  {partnerName} · Last 7 Days
                </Text>
                <View
                  className="flex-row items-start"
                  style={{ width: berealInnerWidth, gap: berealGap, alignSelf: 'center' }}
                >
                  {last7Days.map((day, i) => (
                    <PhotoDayCell
                      key={`partner-${day.toISOString()}`}
                      cellSize={berealCellSize}
                      log={getLogForDay(partnerProfile!.id, day)}
                      accentColor={Colors.pastelPurple}
                      dayLabel={last7DayLabels[i]}
                      onPress={setExpandedLog}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Month calendar — photo days only */}
          <View
            className="bg-[#1A1A1A] p-5 rounded-3xl mb-8 overflow-hidden"
            style={{ width: windowWidth - SCROLL_H_PAD, alignSelf: 'center' }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Pressable
                onPress={() => {
                  if (monthFetching) return;
                  setCalendarMonth((d) => startOfMonth(subMonths(d, 1)));
                }}
                disabled={monthFetching}
                className="p-3 rounded-2xl bg-white/10 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                hitSlop={12}
              >
                <ChevronLeft size={22} color="#fff" />
              </Pressable>
              <View className="flex-row items-center gap-2 flex-1 justify-center px-2">
                <Text className="text-white font-black text-lg tracking-tight text-center">
                  {format(calendarMonth, 'MMMM yyyy')}
                </Text>
                {monthFetching ? (
                  <ActivityIndicator size="small" color={Colors.pastelYellow} />
                ) : null}
              </View>
              <Pressable
                onPress={() => {
                  if (!canGoNextMonth || monthFetching) return;
                  setCalendarMonth((d) => startOfMonth(addMonths(d, 1)));
                }}
                disabled={!canGoNextMonth || monthFetching}
                className={cn(
                  'p-3 rounded-2xl bg-white/10 active:opacity-80',
                  (!canGoNextMonth || monthFetching) && 'opacity-30',
                )}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                hitSlop={12}
              >
                <ChevronRight size={22} color="#fff" />
              </Pressable>
            </View>

            <Text className="text-white/40 text-xs font-medium mb-2">
              Days with a workout photo — you, {hasPartner ? partnerName : 'partner'}, or both.
            </Text>

            <View
              className="flex-row mb-2"
              style={{ width: calInnerWidth, gap: calGap, alignSelf: 'center' }}
            >
              {DAY_LABELS.map((l, i) => (
                <Text
                  key={i}
                  className="text-white/35 text-[10px] font-bold text-center"
                  style={{ width: calCellSize }}
                >
                  {l}
                </Text>
              ))}
            </View>

            <View style={{ gap: calGap }}>
              {calendarWeekRows.map((week, wi) => (
                <View
                  key={`${format(calendarMonth, 'yyyy-MM')}-${wi}`}
                  className="flex-row"
                  style={{ width: calInnerWidth, gap: calGap, alignSelf: 'center' }}
                >
                  {week.map((day) => {
                    const kind = getDayCalendarKind(day);
                    const bg =
                      kind === 'both'
                        ? Colors.pastelYellow
                        : kind === 'me'
                          ? Colors.pastelGreen
                          : kind === 'partner'
                            ? Colors.pastelPurple
                            : kind === 'outside'
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(255,255,255,0.06)';
                    const photoDay = kind === 'both' || kind === 'me' || kind === 'partner';
                    return (
                      <View
                        key={day.toISOString()}
                        style={{
                          width: calCellSize,
                          height: calCellSize,
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: bg,
                          opacity: kind === 'outside' ? 0.45 : 1,
                        }}
                      >
                        <Text
                          className={cn(
                            'text-[11px] font-bold',
                            photoDay ? 'text-black/75' : 'text-white/35',
                          )}
                        >
                          {format(day, 'd')}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-white/10">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: Colors.pastelGreen }} />
                <Text className="text-white/50 text-xs font-medium">You</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: Colors.pastelPurple }} />
                <Text className="text-white/50 text-xs font-medium">
                  {hasPartner ? partnerName : 'Partner'}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: Colors.pastelYellow }} />
                <Text className="text-white/50 text-xs font-medium">Both</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-sm bg-white/10" />
                <Text className="text-white/50 text-xs font-medium">No photo</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

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
                    {`"${expandedLog.caption}"`}
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
