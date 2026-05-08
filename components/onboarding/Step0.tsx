import { View, Text, Pressable } from 'react-native';
import { Dumbbell, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
  onSignIn?: () => void;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SKIPPED = [0, 1, 3, 4, 6];

export function Step0({ nextStep, onSignIn }: Props) {
  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-center gap-10 px-4">
        <View>
          <Text className="text-4xl font-black text-white text-center leading-tight">
            You said you'd go to{'\n'}the gym today.
          </Text>
          <Text className="text-pastel-blue text-lg text-center mt-3 leading-relaxed font-medium">
            But without anyone watching,{'\n'}it's just too easy to skip.
          </Text>
        </View>

        <View className="items-center gap-6">
          <View className="bg-[#1A1A1A] rounded-3xl border border-white/5 p-5 w-full">
            <Text className="text-[10px] text-white/45 uppercase tracking-widest font-bold mb-4 text-center">
              Your Week
            </Text>

            <View className="flex-row justify-between px-2">
              {DAYS.map((day, i) => {
                const skipped = SKIPPED.includes(i);
                return (
                  <View key={i} className="items-center gap-2">
                    <Text className="text-[11px] font-bold text-white/45">{day}</Text>
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        skipped
                          ? 'bg-pastel-red/20 border border-pastel-red/45'
                          : 'border border-dashed border-white/15'
                      }`}
                    >
                      {skipped && <X size={15} color={Colors.pastelRed} />}
                    </View>
                  </View>
                );
              })}
            </View>

            <View className="mt-5 items-center gap-2">
              <Dumbbell size={20} color="rgba(255,255,255,0.35)" />
              <Text className="text-[11px] text-white/45 font-medium">0 of 7 workouts</Text>
            </View>
          </View>

          <Text className="text-white/45 text-xs text-center italic">
            No partner. No check-ins. No consequence.
          </Text>
        </View>
      </View>

      <View className="w-full pt-4 pb-2 mb-12 max-w-sm px-4 gap-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Let's fix this</Text>
        </Pressable>

        {onSignIn && (
          <Pressable onPress={onSignIn} className="py-2 items-center">
            <Text className="text-white/45 text-sm">
              Already have an account?{' '}
              <Text className="text-pastel-orange font-bold">Sign in</Text>
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
