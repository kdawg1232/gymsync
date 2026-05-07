import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Type } from 'lucide-react-native';

interface Props {
  nextStep: () => void;
  name: string;
  setName: (v: string) => void;
}

export function Step9({ nextStep, name, setName }: Props) {
  const canProceed = name.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 items-center pt-10 w-full">
        <View className="flex-1 w-full max-w-sm justify-start px-4">
          <Text className="text-3xl font-black text-white text-center mb-2">
            Who are you in this duo?
          </Text>
          <Text className="text-white/50 text-center mb-8">
            What should your partner call you?
          </Text>

          <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 gap-4">
            <View className="absolute top-0 left-0 right-0 h-1 bg-pastel-blue" />

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Type size={16} color="rgba(255,255,255,0.4)" />
                <Text className="text-xs font-bold uppercase tracking-widest text-white/40">
                  First Name
                </Text>
              </View>
              <TextInput
                autoFocus
                value={name}
                onChangeText={setName}
                placeholder="Enter your first name"
                placeholderTextColor="rgba(255,255,255,0.2)"
                className="text-xl font-bold text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10"
              />
            </View>
          </View>
        </View>

        <View className="w-full pb-8 pt-4 max-w-sm px-4">
          <Pressable
            onPress={nextStep}
            disabled={!canProceed}
            className={`w-full bg-white py-4 rounded-2xl items-center active:opacity-80 ${
              !canProceed ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-black font-bold text-lg">That's me</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
