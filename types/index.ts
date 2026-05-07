export type Tab = 'home' | 'rules' | 'log' | 'history' | 'profile';

export type Mood = 'happy' | 'tired' | 'pumped' | 'dead';

export interface WorkoutLog {
  id: string;
  userId: string;
  userName: string;
  date: Date;
  imageUrl: string;
  caption: string;
  mood: Mood;
}
