import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Flame, Dumbbell } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const { logs, wager, goal } = useApp();

  const myLogs = logs.filter((l) => l.userId === 'me');
  const partnerLogs = logs.filter((l) => l.userId === 'partner');

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="flex-1 p-6"
    >
      <View className="pt-8 mb-8">
        <Text className="text-4xl font-bold text-white tracking-tight mb-2">Hey there.</Text>
        <Text className="text-white/60 text-lg">Let's check in on Sarah.</Text>
      </View>

      {/* Partner Card */}
      <View className="bg-pastel-purple rounded-[32px] p-6 mb-8 overflow-hidden relative">
        <View className="relative z-10">
          <Text className="text-2xl font-bold text-black mb-4">Sarah's Week</Text>
          <View className="flex-row items-end gap-3 mb-6">
            <Text className="text-5xl font-black text-black">{partnerLogs.length}</Text>
            <Text className="text-lg font-medium text-black/60 pb-1">/ {goal} days</Text>
          </View>

          <View className="w-full bg-black/10 h-3 rounded-full overflow-hidden">
            <MotiView
              from={{ width: '0%' }}
              animate={{
                width: `${Math.min((partnerLogs.length / goal) * 100, 100)}%`,
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

      {/* Your Progress */}
      <View className="bg-pastel-orange rounded-[32px] p-6 mb-8 overflow-hidden relative">
        <View className="relative z-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-black">Your Progress</Text>
            <View className="bg-black/10 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Flame size={16} color="#FF5722" fill="#FF5722" />
              <Text className="text-sm font-bold text-black">4 wks</Text>
            </View>
          </View>

          <View className="flex-row items-end gap-2 mb-4">
            <Text className="text-4xl font-black text-black">{myLogs.length}</Text>
            <Text className="text-sm font-medium text-black/60 pb-1">/ {goal}</Text>
          </View>

          <View className="w-full bg-black/10 h-3 rounded-full overflow-hidden">
            <MotiView
              from={{ width: '0%' }}
              animate={{
                width: `${Math.min((myLogs.length / goal) * 100, 100)}%`,
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
        <Text className="text-white/40 text-sm mt-2">You currently owe: 0</Text>
      </View>
    </MotiView>
  );
}
