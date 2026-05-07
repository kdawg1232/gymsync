import { supabase } from './supabase';

async function uploadFile(
  bucket: string,
  path: string,
  uri: string,
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filePath = `${path}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  return uploadFile('avatars', `${userId}/avatar`, uri);
}

export async function uploadWorkoutPhoto(
  userId: string,
  uri: string,
): Promise<string> {
  const timestamp = Date.now();
  return uploadFile('workout-photos', `${userId}/${timestamp}`, uri);
}
