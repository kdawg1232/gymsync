import { View, Text, Pressable } from 'react-native';
import { Stamp, Edit3 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step11({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4">
        <Stamp size={80} color={Colors.pastelOrange} style={{ marginBottom: 32 }} />

        <Text className="text-4xl font-black text-white text-center leading-tight mb-6">
          Seal the Pact.
        </Text>
        <Text className="text-white/60 text-lg text-center leading-relaxed mb-12 px-6">
          "I commit to pushing myself and supporting my partner. This is our shared journey."
        </Text>

        <View className="w-full h-40 bg-[#1A1A1A] rounded-3xl border border-white/5 items-center justify-center mb-4">
          <View className="flex-row items-center gap-2">
            <Edit3 size={20} color="rgba(255,255,255,0.2)" />
            <Text className="text-white/20 font-bold text-xl">Draw Signature</Text>
          </View>
        </View>

        <Pressable>
          <Text className="text-white/40 font-bold text-sm">Clear</Text>
        </Pressable>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-pastel-orange py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">I Agree</Text>
        </Pressable>
      </View>
    </View>
  );
}
