import { View, Text, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';

interface Props {
  nextStep: () => void;
  goal: number;
  setGoal: (v: number) => void;
}

export function Step6({ nextStep, goal, setGoal }: Props) {
  const label = goal <= 2 ? 'Casual' : goal <= 4 ? 'Active' : 'Athlete';

  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-start gap-12 px-4">
        <Text className="text-3xl font-black text-white text-center leading-tight">
          What's your collective pace?
        </Text>
        <Text className="text-white/50 text-sm text-center">
          Match your partner or set your own path. You decide the rhythm.
        </Text>

        <View className="flex-1 items-center justify-center w-full">
          <Svg viewBox="0 0 200 100" style={{ width: '100%', height: 120 }}>
            <Path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth={20}
              strokeLinecap="round"
            />
            <Path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#fff"
              strokeWidth={20}
              strokeLinecap="round"
              strokeDasharray="280"
              strokeDashoffset={280 - (280 * goal) / 7}
            />
          </Svg>

          <View className="items-center mt-[-20px]">
            <View className="flex-row items-baseline gap-1">
              <Text className="text-6xl font-black text-white">{goal}</Text>
              <Text className="text-xl text-white/40">/ 7</Text>
            </View>
            <Text className="text-[10px] tracking-widest font-bold uppercase mt-2 text-pastel-blue">
              {label}
            </Text>
          </View>
        </View>

        <Slider
          minimumValue={1}
          maximumValue={7}
          step={1}
          value={goal}
          onValueChange={(v) => setGoal(v)}
          minimumTrackTintColor="#ffffff"
          maximumTrackTintColor="rgba(255,255,255,0.1)"
          thumbTintColor="#ffffff"
          style={{ width: '100%', height: 40 }}
        />
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Set Pace</Text>
        </Pressable>
      </View>
    </View>
  );
}
