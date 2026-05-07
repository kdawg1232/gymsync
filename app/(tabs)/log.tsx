import { useState } from 'react';
import { View, Text, Pressable, TextInput, Image } from 'react-native';
import { MotiView } from 'moti';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { cn } from '@/lib/utils';
import { DEMO_FALLBACK_IMG } from '@/constants/demo-data';
import { Colors } from '@/constants/colors';
import type { Mood } from '@/types';
import { useRouter } from 'expo-router';

const BG_COLORS: Record<Mood, string> = {
  happy: 'bg-pastel-orange',
  pumped: 'bg-pastel-green',
  tired: 'bg-pastel-yellow',
  dead: 'bg-pastel-purple',
};

const MOOD_COLORS: Record<Mood, string> = {
  happy: Colors.pastelOrange,
  pumped: Colors.pastelGreen,
  tired: Colors.pastelYellow,
  dead: Colors.pastelPurple,
};

export default function LogScreen() {
  const { addLog } = useApp();
  const router = useRouter();
  const [mood, setMood] = useState<Mood>('happy');
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      const libResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!libResult.canceled) {
        setImageUri(libResult.assets[0].uri);
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submit = () => {
    addLog({
      id: Math.random().toString(),
      userId: 'me',
      userName: 'Me',
      date: new Date(),
      imageUrl: imageUri || DEMO_FALLBACK_IMG,
      caption,
      mood,
    });
    router.replace('/(tabs)');
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('flex-1 p-6 justify-center', BG_COLORS[mood])}
    >
      <View className="flex-1 items-center justify-center pt-8">
        <Text className="text-3xl font-bold text-black text-center mb-6">
          How was the workout?
        </Text>

        <View className="flex-row flex-wrap gap-4 justify-center mb-8 max-w-[280px]">
          {(['happy', 'pumped', 'tired', 'dead'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMood(m)}
              className={cn(
                'w-20 h-20 rounded-3xl items-center justify-center gap-2 p-2',
                mood === m ? 'bg-black scale-110' : 'bg-black/5'
              )}
            >
              <FaceIcon
                mood={m}
                size={32}
                color={mood === m ? '#fff' : '#000'}
              />
              <Text
                className={cn(
                  'text-xs font-bold capitalize',
                  mood === m ? 'text-white' : 'text-black'
                )}
              >
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="w-full max-w-sm gap-4">
          <Pressable
            onPress={pickImage}
            className="aspect-square bg-black/10 rounded-[32px] overflow-hidden items-center justify-center"
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <View className="items-center">
                <Camera size={48} color="rgba(0,0,0,0.4)" />
                <Text className="text-black/60 font-bold mt-2">Tap to add photo</Text>
              </View>
            )}
          </Pressable>

          <TextInput
            placeholder="Add a quick note..."
            value={caption}
            onChangeText={setCaption}
            placeholderTextColor="rgba(0,0,0,0.4)"
            className="w-full bg-black/5 p-4 rounded-2xl text-lg font-medium text-black"
          />
        </View>
      </View>

      <View className="pb-32 px-4 pt-6">
        <Pressable
          onPress={submit}
          disabled={!imageUri && !caption}
          className={cn(
            'w-full bg-black py-5 rounded-full items-center active:opacity-80',
            !imageUri && !caption && 'opacity-50'
          )}
        >
          <Text className="text-white text-xl font-bold">Send to Sarah</Text>
        </Pressable>
      </View>
    </MotiView>
  );
}
