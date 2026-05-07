import { View, Text, Pressable } from 'react-native';
import { User, Users, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step5({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <Text className="text-4xl font-black text-white text-center leading-tight mb-4">
          Evolve{'\n'}together.
        </Text>
        <Text className="text-white/50 text-sm text-center leading-relaxed mb-12">
          Better health, better bond, better life. Start your shared evolution today.
        </Text>

        <View className="flex-row justify-center items-center gap-4 h-48">
          <View className="w-24 h-48 rounded-full border border-white/5 items-center justify-center bg-[#0A0A0A] opacity-40">
            <User size={32} color="rgba(255,255,255,0.2)" />
            <Text className="text-[10px] tracking-widest font-bold text-white mt-2">BEFORE</Text>
          </View>

          <ArrowRight size={20} color="rgba(255,255,255,0.2)" />

          <View className="w-32 h-48 rounded-full border border-pastel-orange/30 items-center justify-center bg-pastel-orange/10">
            <Users size={48} color={Colors.pastelOrange} />
            <Text className="text-[10px] tracking-widest font-bold text-pastel-orange mt-2">
              AFTER
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-pastel-orange py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Unlock Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
}
