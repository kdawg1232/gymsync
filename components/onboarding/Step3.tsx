import { View, Text, Pressable } from 'react-native';
import { Handshake, ArrowRight, Scale, RefreshCw } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step3({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <Text className="text-3xl font-black text-white text-center leading-tight mb-12">
          Healthy Competition.
        </Text>

        <View
          className="bg-[#1A1A1A] rounded-3xl border border-white/5 p-6 mb-8 overflow-hidden"
          style={{ transform: [{ rotate: '2deg' }] }}
        >
          <View className="flex-row items-center gap-3 mb-6">
            <View className="w-12 h-12 rounded-xl bg-pastel-blue/20 items-center justify-center">
              <Handshake size={24} color={Colors.pastelBlue} />
            </View>
            <Text className="font-bold text-xl tracking-tight text-white">Challenge Accepted</Text>
          </View>

          <View className="gap-4">
            <View className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <Text className="text-[10px] text-pastel-red uppercase font-bold tracking-widest mb-1">
                Loser
              </Text>
              <Text className="text-sm font-medium text-white">
                Takes the trash out for a week
              </Text>
            </View>

            <View className="items-center">
              <ArrowRight
                size={16}
                color="rgba(255,255,255,0.2)"
                style={{ transform: [{ rotate: '90deg' }] }}
              />
            </View>

            <View className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <Text className="text-[10px] text-pastel-green uppercase font-bold tracking-widest mb-1">
                Winner
              </Text>
              <Text className="text-sm font-medium text-white">Chooses the next movie</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Game On</Text>
        </Pressable>
      </View>
    </View>
  );
}
