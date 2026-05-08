import type { Mood } from '@/types';

export const Colors = {
  pastelOrange: '#F9C38E',
  pastelPurple: '#959BFF',
  pastelGreen: '#93E2D5',
  pastelPink: '#FF9B9B',
  pastelYellow: '#FCD299',
  pastelBlue: '#89CFF0',
  pastelRed: '#FF6B6B',

  background: '#0A0A0A',
  card: '#1A1A1A',
  text: '#F5F5F5',
  textMuted: 'rgba(255,255,255,0.6)',
  textDimmed: 'rgba(255,255,255,0.4)',
  textFaint: 'rgba(255,255,255,0.2)',
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',
} as const;

export const MoodColors: Record<Mood, string> = {
  happy: Colors.pastelOrange,
  pumped: Colors.pastelGreen,
  tired: Colors.pastelYellow,
  dead: Colors.pastelPurple,
};
