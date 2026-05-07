import { View, Text, Image, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { cn } from '@/lib/utils';
import { Colors } from '@/constants/colors';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HistoryScreen() {
  const { logs } = useApp();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const hasLog = (userId: string, date: Date) =>
    logs.some((l) => l.userId === userId && isSameDay(l.date, date));

  const sortedLogs = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      className="flex-1 p-6 pt-14"
    >
      <Text className="text-3xl font-bold text-pastel-yellow mb-6">History</Text>

      {/* Week Tracker */}
      <View className="bg-[#1A1A1A] p-5 rounded-3xl mb-8">
        <Text className="text-white/60 font-bold text-sm tracking-wide uppercase mb-6">
          This Week
        </Text>

        <View className="gap-5">
          {/* Partner Row */}
          <View className="flex-row items-center gap-4">
            <Text className="text-white/40 font-medium w-12">Sarah</Text>
            <View className="flex-1 flex-row justify-between relative">
              <View className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2" />
              {days.map((d) => (
                <View
                  key={d.toString()}
                  className={cn(
                    'w-6 h-6 rounded-full border-4 z-10',
                    hasLog('partner', d)
                      ? 'bg-pastel-purple border-pastel-purple'
                      : 'bg-[#1A1A1A] border-white/5'
                  )}
                />
              ))}
            </View>
          </View>

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
                    hasLog('me', d)
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

      {/* Workout Grid */}
      <View className="flex-row flex-wrap gap-3 pb-8">
        {sortedLogs.map((log) => (
          <View
            key={log.id}
            className="w-[47%] aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A1A1A]"
          >
            <Image
              source={{ uri: log.imageUrl }}
              className="w-full h-full absolute"
              style={{ resizeMode: 'cover' }}
            />
            {/* Gradient Overlay */}
            <View className="absolute inset-0 bg-black/40" />
            <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/60" />

            <View className="absolute bottom-3 left-3 right-3">
              <Text className="text-white font-bold leading-none">{log.userName}</Text>
              <Text className="text-white/60 text-xs font-medium">{format(log.date, 'MMM d')}</Text>
            </View>

            <View className="absolute top-3 left-3 bg-black/40 p-1.5 rounded-full border border-white/10">
              <FaceIcon
                mood={log.mood}
                size={16}
                color={log.userId === 'me' ? Colors.pastelGreen : Colors.pastelPurple}
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
        ))}
      </View>
    </MotiView>
  );
}
