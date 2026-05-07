import { Pressable, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';

interface SettingsMenuItemProps {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
}

export function SettingsMenuItem({ icon, label, onPress }: SettingsMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center justify-between p-5 bg-[#1A1A1A] rounded-3xl active:scale-95"
      style={{ transform: [{ scale: 1 }] }}
    >
      <View className="flex-row items-center gap-4">
        {icon}
        <Text className="font-bold text-lg text-white">{label}</Text>
      </View>
      <ChevronRight size={24} color="rgba(255,255,255,0.3)" />
    </Pressable>
  );
}
