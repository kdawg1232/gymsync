import { subDays } from 'date-fns';
import type { WorkoutLog } from '@/types';

export const DEMO_PARTNER_IMG =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80';
export const DEMO_USER_IMG =
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80';
export const DEMO_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80';

export const INITIAL_LOGS: WorkoutLog[] = [
  {
    id: '1',
    userId: 'partner',
    userName: 'Sarah',
    date: new Date(),
    imageUrl: DEMO_PARTNER_IMG,
    caption: 'Crushed legs today!',
    mood: 'pumped',
  },
  {
    id: '2',
    userId: 'me',
    userName: 'Me',
    date: subDays(new Date(), 1),
    imageUrl: DEMO_USER_IMG,
    caption: 'Quick run in the park.',
    mood: 'happy',
  },
];
