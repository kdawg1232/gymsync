import { View, Text, Pressable } from 'react-native';
import { ImageIcon } from 'lucide-react-native';

interface Props {
  nextStep: () => void;
}

export function Step10({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-start px-4">
        <Text className="text-3xl font-black text-white text-center mb-4">Show your face.</Text>
        <Text className="text-white/50 text-center mb-16">
          Put a face to the name. Make it bold.
        </Text>

        <View className="relative w-64 h-64 self-center">
          <View className="absolute inset-0 rounded-full border-2 border-dashed border-white/20" />

          <View className="absolute top-2 left-2 right-2 bottom-2 bg-[#1A1A1A] rounded-full items-center justify-center border border-white/5 overflow-hidden">
            <ImageIcon size={64} color="rgba(255,255,255,0.1)" />
            <Text className="text-white/30 font-bold text-sm mt-4">Upload Photo</Text>
          </View>

          <View className="absolute -top-4 -right-4 w-12 h-12 bg-pastel-purple/20 rounded-full" />
          <View className="absolute -bottom-4 -left-4 w-16 h-16 bg-pastel-orange/20 rounded-full" />
        </View>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white/10 py-4 rounded-2xl items-center border border-white/10 active:opacity-80"
        >
          <Text className="text-white font-bold text-lg">Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}
