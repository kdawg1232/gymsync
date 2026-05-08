import { View, Text, Pressable } from 'react-native';
import { Flame, Coffee, Link } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

const STEPS = [
  {
    icon: Flame,
    color: Colors.pastelOrange,
    title: 'Set your weekly goal',
    subtitle: 'How many workouts per week?',
  },
  {
    icon: Coffee,
    color: Colors.pastelBlue,
    title: 'Pick a wager',
    subtitle: 'What does the loser owe?',
  },
  {
    icon: Link,
    color: Colors.pastelPurple,
    title: 'Invite your partner',
    subtitle: 'Send them a link to join.',
  },
];

export function Step5({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <View className="mb-12">
          <Text className="text-3xl font-black text-white text-center leading-tight">
            You've got the idea.
          </Text>
          <Text className="text-pastel-blue text-sm text-center mt-3 leading-relaxed px-2">
            Now let's build your partnership.{'\n'}It takes 2 minutes.
          </Text>
        </View>

        <View className="gap-3">
          {STEPS.map((item, i) => {
            const Icon = item.icon;
            return (
              <View
                key={i}
                className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-4 flex-row items-center gap-4"
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View
                    className="w-11 h-11 rounded-xl items-center justify-center"
                    style={{ backgroundColor: item.color + '18' }}
                  >
                    <Icon size={20} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm">{item.title}</Text>
                    <Text className="text-white/40 text-xs mt-0.5">{item.subtitle}</Text>
                  </View>
                </View>
                <View
                  className="w-6 h-6 rounded-full border-2 items-center justify-center"
                  style={{ borderColor: item.color + '40' }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: item.color }}>
                    {i + 1}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className="w-full pt-4 pb-2 mb-12 max-w-sm px-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-pastel-orange py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Let's set it up</Text>
        </Pressable>
      </View>
    </View>
  );
}
