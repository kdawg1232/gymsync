import { View, Text, Pressable } from 'react-native';
import Svg, { Circle as SvgCircle, Path } from 'react-native-svg';
import { Flame } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step2({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4">
        <Text className="text-3xl font-black text-white text-center leading-tight mb-12">
          Keep the streak alive.
        </Text>

        <View className="relative w-64 h-64 mb-16 items-center justify-center">
          <Svg
            viewBox="0 0 100 100"
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <SvgCircle cx={50} cy={50} r={45} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
            <Path
              d="M 50,5 A 45,45 0 1,1 5,50"
              fill="none"
              stroke={Colors.pastelOrange}
              strokeWidth={8}
              strokeLinecap="round"
            />
          </Svg>

          <View className="items-center justify-center bg-[#0A0A0A] w-48 h-48 rounded-full border border-white/5">
            <Flame size={48} color={Colors.pastelOrange} />
            <Text className="text-4xl font-black text-white mt-2">94%</Text>
            <Text className="text-[10px] text-white/40 tracking-widest uppercase mt-1">
              Shared Battery
            </Text>
          </View>
        </View>

        <Text className="text-white/50 text-sm text-center leading-relaxed px-4">
          Every time you show up, you power your shared progress. Don't let the flame go out.
        </Text>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Fuel The Fire</Text>
        </Pressable>
      </View>
    </View>
  );
}
