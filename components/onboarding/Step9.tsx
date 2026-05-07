import { View, Text, Pressable, TextInput } from 'react-native';
import { Type } from 'lucide-react-native';

interface Props {
  nextStep: () => void;
}

export function Step9({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-start px-4">
        <Text className="text-3xl font-black text-white text-center mb-2">
          Who are you in this duo?
        </Text>
        <Text className="text-white/50 text-center mb-12">Your partner will see this name.</Text>

        <View className="bg-[#1A1A1A] p-8 rounded-[32px] border border-white/5 overflow-hidden">
          <View className="absolute top-0 left-0 right-0 h-1 bg-pastel-blue" />

          <View className="flex-row justify-between items-start mb-12">
            <Type size={24} color="rgba(255,255,255,0.2)" />
            <View className="px-3 py-1 bg-white/5 rounded-full">
              <Text className="text-[10px] font-bold tracking-widest uppercase text-white/40">
                Member ID
              </Text>
            </View>
          </View>

          <TextInput
            autoFocus
            placeholder="Enter your name"
            placeholderTextColor="rgba(255,255,255,0.2)"
            className="text-center text-4xl font-black text-white pb-4 border-b-2 border-white/10"
            style={{ borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.1)' }}
          />
        </View>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Claim Identity</Text>
        </Pressable>
      </View>
    </View>
  );
}
