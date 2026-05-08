import { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, LayoutChangeEvent, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Stamp, Edit3 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

type Point = { x: number; y: number };

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

export function Step11({ nextStep }: Props) {
  const [strokes, setStrokes] = useState<string[]>([]);
  const [activePoints, setActivePoints] = useState<Point[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const activePointsRef = useRef<Point[]>([]);

  const clearSignature = useCallback(() => {
    setStrokes([]);
    setActivePoints([]);
    activePointsRef.current = [];
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const p = { x: locationX, y: locationY };
        activePointsRef.current = [p];
        setActivePoints([p]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const p = { x: locationX, y: locationY };
        activePointsRef.current = [...activePointsRef.current, p];
        setActivePoints(activePointsRef.current);
      },
      onPanResponderRelease: () => {
        const pts = activePointsRef.current;
        activePointsRef.current = [];
        setActivePoints([]);
        if (pts.length === 0) return;
        let path = pointsToPath(pts);
        if (pts.length === 1) {
          const { x, y } = pts[0];
          path = `M ${x} ${y} L ${x + 0.5} ${y + 0.5}`;
        }
        setStrokes((prev) => [...prev, path]);
      },
    }),
  ).current;

  const activePath =
    activePoints.length > 0 ? pointsToPath(activePoints) : '';
  const hasInk = strokes.length > 0 || activePoints.length > 0;
  const showPlaceholder = !hasInk;

  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4">
        <Stamp size={80} color={Colors.pastelOrange} style={{ marginBottom: 32 }} />

        <Text className="text-4xl font-black text-white text-center leading-tight mb-6">
          Seal the Pact.
        </Text>
        <Text className="text-pastel-blue text-lg text-center leading-relaxed mb-12 px-6">
          "I commit to pushing myself and supporting my partner. This is our shared journey."
        </Text>

        <View
          className="w-full h-40 bg-[#1A1A1A] rounded-3xl border border-white/5 mb-4 overflow-hidden"
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          {size.width > 0 && size.height > 0 ? (
            <Svg width={size.width} height={size.height} style={{ position: 'absolute', left: 0, top: 0 }}>
              {strokes.map((d, i) => (
                <Path
                  key={i}
                  d={d}
                  stroke={Colors.pastelOrange}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {activePath ? (
                <Path
                  d={activePath}
                  stroke={Colors.pastelOrange}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : null}
            </Svg>
          ) : null}

          {showPlaceholder ? (
            <View
              pointerEvents="none"
              className="absolute inset-0 items-center justify-center"
            >
              <View className="flex-row items-center gap-2">
                <Edit3 size={20} color="rgba(255,255,255,0.4)" />
                <Text className="text-white/45 font-bold text-xl">Tap to sign</Text>
              </View>
            </View>
          ) : null}
        </View>

        <Pressable onPress={clearSignature} hitSlop={12}>
          <Text className="text-white/45 font-bold text-sm">Clear</Text>
        </Pressable>
      </View>

      <View className="w-full pt-4 pb-2 mb-12 max-w-sm px-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-pastel-orange py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">I Agree</Text>
        </Pressable>
      </View>
    </View>
  );
}
