import { View, Text, Pressable } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

function ProgressDots({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <View className="flex-row gap-1.5 mt-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < filled ? color : 'rgba(255,255,255,0.12)' }}
        />
      ))}
    </View>
  );
}

export function Step1({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <View className="mb-14">
          <Text className="text-3xl font-black text-white text-center leading-tight">
            Meet your{'\n'}
            <Text className="text-pastel-orange">accountability partner.</Text>
          </Text>
          <Text className="text-pastel-blue text-sm text-center mt-3 leading-relaxed px-2">
            GymSync pairs you with someone who keeps{'\n'}you honest — with real proof and real stakes.
          </Text>
        </View>

        <View className="items-center mb-14">
          <View className="flex-row items-center gap-0">
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center border-2 border-white/20">
                <User size={28} color="rgba(255,255,255,0.6)" />
              </View>
              <Text className="text-xs font-bold text-white/50 mt-2">You</Text>
              <ProgressDots filled={2} total={3} color={Colors.pastelOrange} />
            </View>

            <View className="mx-4 items-center">
              <Svg width={60} height={2}>
                <Line
                  x1={0} y1={1} x2={60} y2={1}
                  stroke={Colors.pastelOrange}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </Svg>
              <Svg width={60} height={2} style={{ marginTop: 4 }}>
                <Line
                  x1={0} y1={1} x2={60} y2={1}
                  stroke={Colors.pastelOrange}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </Svg>
            </View>

            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-pastel-orange/15 items-center justify-center border-2 border-pastel-orange/40">
                <User size={28} color={Colors.pastelOrange} />
              </View>
              <Text className="text-xs font-bold text-white/50 mt-2">Partner</Text>
              <ProgressDots filled={3} total={3} color={Colors.pastelOrange} />
            </View>
          </View>

          <View className="mt-6 bg-[#1A1A1A] rounded-2xl border border-white/5 px-5 py-3">
            <Text className="text-[10px] text-white/50 uppercase tracking-widest font-bold text-center">
              Synced — This Week
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full pt-4 pb-2 mb-12 max-w-sm px-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Here's how it works</Text>
        </Pressable>
      </View>
    </View>
  );
}
