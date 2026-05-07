import { View, Text, Pressable } from 'react-native';
import { User, Plus, Share2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step12({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4">
        <Text className="text-4xl font-black text-white text-center mb-4">
          Tandem requires two.
        </Text>
        <Text className="text-white/50 text-base text-center leading-relaxed mb-12">
          Your dashboard is locked until your partner joins the pact. Summon them.
        </Text>

        <View className="bg-[#1A1A1A] w-full p-8 rounded-[32px] border border-white/5 overflow-hidden mb-12">
          <View className="flex-row justify-center items-center gap-4 mb-8">
            <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20">
              <User size={24} color="#fff" />
            </View>
            <View className="items-center gap-1">
              <View className="w-1 h-1 bg-white/20 rounded-full" />
              <View className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <View className="w-2 h-2 bg-pastel-purple rounded-full" />
            </View>
            <View className="w-16 h-16 rounded-full border-2 border-dashed border-pastel-purple/50 items-center justify-center bg-pastel-purple/5">
              <Plus size={24} color={Colors.pastelPurple} />
            </View>
          </View>

          <Pressable className="w-full bg-white/10 border border-white/10 py-4 rounded-2xl flex-row items-center justify-center gap-2">
            <Share2 size={20} color="#fff" />
            <Text className="text-white font-bold text-base">Share Invite Link</Text>
          </Pressable>
        </View>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4 gap-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-pastel-purple py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">I've Invited Them</Text>
        </Pressable>
        <Pressable onPress={nextStep} className="w-full py-2 items-center">
          <Text className="text-white/50 font-bold text-sm">They already sent me a link</Text>
        </Pressable>
      </View>
    </View>
  );
}
