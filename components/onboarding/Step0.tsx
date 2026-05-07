import { View, Text, Pressable } from 'react-native';
import Svg, { Path, Circle, LinearGradient, Stop, Defs } from 'react-native-svg';

interface Props {
  nextStep: () => void;
}

export function Step0({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center gap-12 px-4">
        <Text className="text-4xl font-black text-white text-center leading-tight">
          Don't leave{'\n'}
          <Text className="text-white/40">your partner behind.</Text>
        </Text>

        <View className="flex-row justify-center items-center gap-6">
          <View className="items-center gap-2">
            <Text className="text-white/30 text-xs tracking-widest font-bold">SOLO</Text>
            <Svg width={80} height={120} viewBox="0 0 80 120" style={{ opacity: 0.4 }}>
              <Path d="M 40,120 Q 20,60 10,0" fill="none" stroke="white" strokeWidth={2} strokeDasharray="4 4" />
              <Path d="M 40,120 Q 60,60 70,0" fill="none" stroke="white" strokeWidth={2} strokeDasharray="4 4" />
              <Circle cx={20} cy={30} r={4} fill="white" />
              <Circle cx={60} cy={50} r={4} fill="white" />
            </Svg>
          </View>

          <View className="w-px h-24 bg-white/10" />

          <View className="items-center gap-2">
            <Text className="text-pastel-orange text-xs tracking-widest font-bold">SYNCED</Text>
            <Svg width={80} height={120} viewBox="0 0 80 120">
              <Defs>
                <LinearGradient id="glow" x1="0" y1="1" x2="0" y2="0">
                  <Stop offset="0%" stopColor="transparent" />
                  <Stop offset="100%" stopColor="#F9C38E" />
                </LinearGradient>
              </Defs>
              <Path d="M 40,120 Q 40,60 40,0" fill="none" stroke="url(#glow)" strokeWidth={6} />
              <Circle cx={35} cy={40} r={6} fill="#fff" />
              <Circle cx={45} cy={40} r={6} fill="#fff" />
            </Svg>
          </View>
        </View>

        <Text className="text-white/50 text-lg text-center leading-relaxed font-medium">
          Individual goals are hard to keep.{'\n'}Shared journeys are impossible to quit.
        </Text>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Begin Journey</Text>
        </Pressable>
      </View>
    </View>
  );
}
