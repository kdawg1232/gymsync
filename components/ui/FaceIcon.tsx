import Svg, { Path, Circle } from 'react-native-svg';
import type { Mood } from '@/types';

interface FaceIconProps {
  mood: Mood;
  size?: number;
  color?: string;
}

export function FaceIcon({ mood, size = 24, color = 'currentColor' }: FaceIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {mood === 'happy' && (
        <>
          <Path d="M25 40 Q35 25 45 40" stroke={color} strokeWidth={6} strokeLinecap="round" />
          <Path d="M55 40 Q65 25 75 40" stroke={color} strokeWidth={6} strokeLinecap="round" />
          <Path d="M35 65 Q50 85 65 65" stroke={color} strokeWidth={6} strokeLinecap="round" fill="transparent" />
        </>
      )}
      {mood === 'pumped' && (
        <>
          <Circle cx={35} cy={40} r={8} fill={color} />
          <Circle cx={65} cy={40} r={8} fill={color} />
          <Path d="M30 30 L40 35 M70 30 L60 35" stroke={color} strokeWidth={6} strokeLinecap="round" />
          <Path d="M40 70 L60 70" stroke={color} strokeWidth={8} strokeLinecap="round" />
        </>
      )}
      {mood === 'tired' && (
        <>
          <Path d="M30 45 L45 45" stroke={color} strokeWidth={6} strokeLinecap="round" />
          <Path d="M55 45 L70 45" stroke={color} strokeWidth={6} strokeLinecap="round" />
          <Path d="M45 70 Q50 60 55 70" stroke={color} strokeWidth={6} strokeLinecap="round" />
        </>
      )}
      {mood === 'dead' && (
        <>
          <Path d="M30 35 L45 50 M45 35 L30 50" stroke={color} strokeWidth={6} strokeLinecap="round" />
          <Path d="M55 35 L70 50 M70 35 L55 50" stroke={color} strokeWidth={6} strokeLinecap="round" />
          <Path d="M40 70 Q50 75 60 70" stroke={color} strokeWidth={6} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
