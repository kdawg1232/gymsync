import { supabase } from './supabase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

async function compressImage(uri: string, maxWidth = 800, quality = 0.5): Promise<string> {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    return uri;
  }
}

async function uploadFile(
  bucket: string,
  path: string,
  uri: string,
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const ext = uri.includes('.png') ? 'png' : 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const filePath = `${path}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const compressed = await compressImage(uri, 400, 0.6);
  return uploadFile('avatars', `${userId}/avatar`, compressed);
}

export async function uploadWorkoutPhoto(
  userId: string,
  uri: string,
): Promise<string> {
  const compressed = await compressImage(uri, 800, 0.5);
  const timestamp = Date.now();
  return uploadFile('workout-photos', `${userId}/${timestamp}`, compressed);
}
