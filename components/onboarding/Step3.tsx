import { View, Text, Pressable } from 'react-native';
import { User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

function ProgressBar({ label, filled, total, color, icon }: {
  label: string;
  filled: number;
  total: number;
  color: string;
  icon: 'you' | 'partner';
}) {
  const pct = (filled / total) * 100;
  const complete = filled >= total;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <User size={14} color={color} />
          </View>
          <Text className="text-sm font-bold text-white">{label}</Text>
        </View>
        <Text className="text-sm font-bold" style={{ color }}>
          {filled}/{total}
        </Text>
      </View>

      <View className="h-3 bg-white/5 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </View>

      {complete && (
        <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          Goal hit!
        </Text>
      )}
    </View>
  );
}

export function Step3({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <View className="mb-12">
          <Text className="text-3xl font-black text-white text-center leading-tight">
            Track the week{'\n'}
            <Text className="text-pastel-green">together.</Text>
          </Text>
          <Text className="text-white/40 text-sm text-center mt-3 leading-relaxed px-2">
            Agree on a weekly minimum. Watch each{'\n'}other's progress fill up in real time.
          </Text>
        </View>

        <View className="bg-[#1A1A1A] rounded-3xl border border-white/5 p-6 gap-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
              This Week
            </Text>
            <View className="bg-white/5 px-3 py-1 rounded-full">
              <Text className="text-[10px] text-white/40 font-bold">Goal: 3 workouts</Text>
            </View>
          </View>

          <ProgressBar
            label="You"
            filled={2}
            total={3}
            color={Colors.pastelOrange}
            icon="you"
          />

          <View className="h-px bg-white/5" />

          <ProgressBar
            label="Partner"
            filled={3}
            total={3}
            color={Colors.pastelGreen}
            icon="partner"
          />
        </View>

        <Text className="text-white/30 text-xs text-center mt-6 italic">
          Both bars visible. Both of you accountable.
        </Text>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Keep the momentum</Text>
        </Pressable>
      </View>
    </View>
  );
}
