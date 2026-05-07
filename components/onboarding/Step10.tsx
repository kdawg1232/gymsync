import { useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { ImageIcon, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar } from '@/lib/storage';
import { updateProfile } from '@/lib/database';
import { useApp } from '@/context/AppContext';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step10({ nextStep }: Props) {
  const { user, refreshProfile } = useApp();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(user.id, imageUri);
      await updateProfile(user.id, { avatar_url: url });
      await refreshProfile();
      nextStep();
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message ?? 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-start px-4">
        <Text className="text-3xl font-black text-white text-center mb-4">Show your face.</Text>
        <Text className="text-white/50 text-center mb-16">
          Put a face to the name. Make it bold.
        </Text>

        <Pressable onPress={pickImage} className="relative w-64 h-64 self-center">
          <View className="absolute inset-0 rounded-full border-2 border-dashed border-white/20" />

          <View className="absolute top-2 left-2 right-2 bottom-2 bg-[#1A1A1A] rounded-full items-center justify-center border border-white/5 overflow-hidden">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <>
                <Camera size={64} color="rgba(255,255,255,0.15)" />
                <Text className="text-white/30 font-bold text-sm mt-4">Tap to Choose Photo</Text>
              </>
            )}
          </View>

          <View className="absolute -top-4 -right-4 w-12 h-12 bg-pastel-purple/20 rounded-full" />
          <View className="absolute -bottom-4 -left-4 w-16 h-16 bg-pastel-orange/20 rounded-full" />
        </Pressable>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4 gap-3">
        {imageUri && (
          <Pressable
            onPress={handleUpload}
            disabled={uploading}
            className="w-full bg-pastel-purple py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2"
          >
            {uploading && <ActivityIndicator color="#000" size="small" />}
            <Text className="text-black font-bold text-lg">
              {uploading ? 'Uploading...' : 'Use This Photo'}
            </Text>
          </Pressable>
        )}
        {imageUri ? (
          <Pressable
            onPress={pickImage}
            className="w-full bg-white/10 py-4 rounded-2xl items-center border border-white/10 active:opacity-80"
          >
            <Text className="text-white font-bold text-lg">Choose Different Photo</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={nextStep}
            className="w-full bg-white/10 py-4 rounded-2xl items-center border border-white/10 active:opacity-80"
          >
            <Text className="text-white font-bold text-lg">Skip for now</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
