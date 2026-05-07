import { View, Text, Pressable, Image } from 'react-native';
import { DEMO_USER_IMG, DEMO_PARTNER_IMG } from '@/constants/demo-data';

interface Props {
  nextStep: () => void;
}

export function Step4({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4">
        <Text className="text-4xl font-black text-white text-center leading-tight mb-2">
          Proof in Motion.
        </Text>
        <Text className="text-white/50 text-sm text-center leading-relaxed px-4 mb-12">
          A quick snap to prove you did the work. Your partner is your witness.
        </Text>

        <View className="relative h-72 w-56 border-l-4 border-r-4 border-dashed border-white/10 items-center overflow-hidden py-4">
          <View className="absolute left-1 top-0 bottom-0 w-1.5 justify-between py-2">
            {Array(15)
              .fill(0)
              .map((_, i) => (
                <View key={i} className="w-1.5 h-2 bg-black rounded-sm" />
              ))}
          </View>
          <View className="absolute right-1 top-0 bottom-0 w-1.5 justify-between py-2">
            {Array(15)
              .fill(0)
              .map((_, i) => (
                <View key={i} className="w-1.5 h-2 bg-black rounded-sm" />
              ))}
          </View>

          <View className="gap-4 w-44">
            <Image
              source={{ uri: DEMO_USER_IMG }}
              className="w-full h-32 rounded"
              style={{ resizeMode: 'cover' }}
            />
            <Image
              source={{ uri: DEMO_PARTNER_IMG }}
              className="w-full h-32 rounded"
              style={{ resizeMode: 'cover' }}
            />
          </View>
        </View>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Be Accountable</Text>
        </Pressable>
      </View>
    </View>
  );
}
