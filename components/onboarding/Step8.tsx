import { View, Text, Pressable } from 'react-native';
import { Coffee, Sparkles, Plus, Check } from 'lucide-react-native';
import { Utensils, TicketIcon } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
  wager: string;
  setWager: (v: string) => void;
}

const WAGER_OPTIONS = [
  { icon: 'ticket', label: 'Movie Pick' },
  { icon: 'coffee', label: '1 Coffee' },
  { icon: 'utensils', label: '1 Dinner' },
  { icon: 'sparkles', label: '1 Massage' },
] as const;

function WagerIcon({ type, color }: { type: string; color: string }) {
  const size = 32;
  switch (type) {
    case 'ticket':
      return <TicketIcon size={size} color={color} />;
    case 'coffee':
      return <Coffee size={size} color={color} />;
    case 'utensils':
      return <Utensils size={size} color={color} />;
    case 'sparkles':
      return <Sparkles size={size} color={color} />;
    default:
      return null;
  }
}

export function Step8({ nextStep, wager, setWager }: Props) {
  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-start px-4">
        <Text className="text-4xl font-black text-white leading-tight mb-2">
          What's the prize?
        </Text>
        <Text className="text-pastel-blue text-sm mb-10">
          Select the weekly reward. The loser pays up.
        </Text>

        <View className="flex-row flex-wrap gap-4 mb-4">
          {WAGER_OPTIONS.map((w) => (
            <Pressable
              key={w.label}
              onPress={() => setWager(w.label)}
              className={cn(
                'w-[47%] bg-[#1A1A1A] p-6 rounded-3xl border',
                wager === w.label
                  ? 'border-pastel-blue bg-pastel-blue/10'
                  : 'border-white/5'
              )}
            >
              {wager === w.label && (
                <View className="absolute top-2 right-2">
                  <Check size={16} color={Colors.pastelBlue} />
                </View>
              )}
              <View className="mb-4">
                <WagerIcon type={w.icon} color="rgba(255,255,255,0.75)" />
              </View>
              <Text className="font-bold text-lg text-white">{w.label}</Text>
            </Pressable>
          ))}
        </View>

        <View className="bg-[#1A1A1A] p-4 rounded-3xl flex-row items-center gap-4 border border-white/5">
          <View className="w-12 h-12 bg-white/5 rounded-xl items-center justify-center">
            <Plus size={24} color="rgba(255,255,255,0.45)" />
          </View>
          <View>
            <Text className="font-bold text-white">Custom Reward</Text>
            <Text className="text-xs text-white/45">Set your own stakes</Text>
          </View>
        </View>
      </View>

      <View className="w-full pt-4 pb-2 mb-5 max-w-sm px-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-pastel-blue py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Lock It In</Text>
        </Pressable>
      </View>
    </View>
  );
}
