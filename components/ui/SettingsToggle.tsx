import { View, Text, Switch } from 'react-native';
import type { ReactNode } from 'react';
import { Colors } from '@/constants/colors';

interface SettingsToggleProps {
  icon: ReactNode;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({ icon, label, value, onValueChange, disabled }: SettingsToggleProps) {
  return (
    <View className="w-full flex-row items-center justify-between p-5 bg-[#1A1A1A] rounded-3xl">
      <View className="flex-row items-center gap-4 flex-1">
        {icon}
        <Text className="font-bold text-lg text-white">{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.pastelGreen }}
        thumbColor="#fff"
      />
    </View>
  );
}
