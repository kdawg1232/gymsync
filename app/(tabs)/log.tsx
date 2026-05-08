import { useState } from 'react';
import { View, Text, Pressable, TextInput, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { FaceIcon } from '@/components/ui/FaceIcon';
import { cn } from '@/lib/utils';
import { addWorkoutLog } from '@/lib/database';
import { uploadWorkoutPhoto } from '@/lib/storage';
import { Colors } from '@/constants/colors';
import type { Mood } from '@/types';
import { useRouter } from 'expo-router';

const BG_COLORS: Record<Mood, string> = {
  happy: Colors.pastelOrange,
  pumped: Colors.pastelGreen,
  tired: Colors.pastelYellow,
  dead: Colors.pastelPurple,
};

export default function LogScreen() {
  const { user, pact, partnerName } = useApp();
  const router = useRouter();
  const [mood, setMood] = useState<Mood>('happy');
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageUri) {
        imageUrl = await uploadWorkoutPhoto(user.id, imageUri);
      }

      await addWorkoutLog({
        user_id: user.id,
        pact_id: pact?.id ?? null,
        image_url: imageUrl,
        caption: caption || null,
        mood,
      });

      setMood('happy');
      setCaption('');
      setImageUri(null);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not log workout.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !submitting && (!!imageUri || !!caption.trim());

  return (
    <View className="flex-1" style={{ backgroundColor: BG_COLORS[mood] }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <Text className="text-3xl font-bold text-black text-center mb-6">
            How was the workout?
          </Text>

          <View className="flex-row flex-wrap gap-3 justify-center mb-6" style={{ maxWidth: 240 }}>
            {(['happy', 'pumped', 'tired', 'dead'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMood(m)}
                className={cn(
                  'w-16 h-16 rounded-2xl items-center justify-center gap-1 p-1',
                  mood === m ? 'bg-black' : 'bg-black/5'
                )}
                style={mood === m ? { transform: [{ scale: 1.05 }] } : undefined}
              >
                <FaceIcon
                  mood={m}
                  size={24}
                  color={mood === m ? '#fff' : '#000'}
                />
                <Text
                  className={cn(
                    'text-[10px] font-bold capitalize',
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
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 pb-32 px-8 pt-4" style={{ backgroundColor: BG_COLORS[mood] }}>
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          className={cn(
            'w-full bg-black py-5 rounded-full items-center active:opacity-80 flex-row justify-center gap-2',
            !canSubmit && 'opacity-50'
          )}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : null}
          <Text className="text-white text-xl font-bold">
            {submitting ? 'Logging...' : `Send to ${partnerName}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
