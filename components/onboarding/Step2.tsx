import { View, Text, Pressable } from 'react-native';
import { Camera, Check, Smile, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step2({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <View className="mb-12">
          <Text className="text-3xl font-black text-white text-center leading-tight">
            Log it. <Text className="text-pastel-blue">Prove it.</Text>
          </Text>
          <Text className="text-white/40 text-sm text-center mt-3 leading-relaxed px-2">
            Every workout gets a photo. Your partner is{'\n'}your witness. No faking it.
          </Text>
        </View>

        <View className="flex-row gap-3 mb-8">
          {/* "You log" panel */}
          <View className="flex-1 bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 gap-3">
            <Text className="text-[10px] text-white/30 uppercase tracking-widest font-bold text-center">
              You Log
            </Text>

            <View className="bg-black/40 rounded-xl p-4 items-center gap-3 border border-white/5">
              <View className="w-14 h-14 rounded-xl bg-pastel-blue/15 items-center justify-center border border-dashed border-pastel-blue/30">
                <Camera size={22} color={Colors.pastelBlue} />
              </View>
              <Text className="text-[10px] text-white/30 font-medium">Workout snap</Text>
            </View>

            <View className="flex-row items-center justify-center gap-2 bg-black/30 rounded-lg py-2 px-3">
              <Smile size={14} color={Colors.pastelGreen} />
              <Text className="text-[10px] text-white/40 font-medium">Feeling pumped</Text>
            </View>
          </View>

          {/* Arrow */}
          <View className="justify-center">
            <Text className="text-white/20 text-lg">→</Text>
          </View>

          {/* "Sarah sees it" panel */}
          <View className="flex-1 bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 gap-3">
            <Text className="text-[10px] text-white/30 uppercase tracking-widest font-bold text-center">
              Partner Sees
            </Text>

            <View className="bg-black/40 rounded-xl p-4 items-center gap-3 border border-pastel-green/20">
              <View className="w-14 h-14 rounded-xl bg-pastel-green/15 items-center justify-center">
                <Check size={22} color={Colors.pastelGreen} />
              </View>
              <Text className="text-[10px] text-pastel-green/60 font-medium">Verified</Text>
            </View>

            <View className="flex-row items-center justify-center gap-2 bg-black/30 rounded-lg py-2 px-3">
              <User size={14} color={Colors.pastelOrange} />
              <Text className="text-[10px] text-white/40 font-medium">Partner notified</Text>
            </View>
          </View>
        </View>

        <Text className="text-white/30 text-xs text-center italic">
          Your partner sees the proof in real time.
        </Text>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">No excuses</Text>
        </Pressable>
      </View>
    </View>
  );
}
