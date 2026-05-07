export type Tab = 'home' | 'rules' | 'log' | 'history' | 'profile';

export type Mood = 'happy' | 'tired' | 'pumped' | 'dead';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  invite_code: string;
  partner_id: string | null;
  notification_token: string | null;
  created_at: string;
}

export interface Pact {
  id: string;
  user1_id: string;
  user2_id: string;
  goal: number;
  wager: string;
  user1_debt: number;
  user2_debt: number;
  active: boolean;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  pact_id: string | null;
  image_url: string | null;
  caption: string | null;
  mood: Mood;
  logged_at: string;
  // Joined from profile for display
  user_name?: string;
  user_avatar?: string | null;
}

export interface NotificationPreference {
  user_id: string;
  workout_reminders: boolean;
  partner_activity: boolean;
  weekly_summary: boolean;
  reminder_time: string;
}
