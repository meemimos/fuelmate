import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

type SkeletonBlockProps = {
  height?: number;
  width?: number | string;
  className?: string;
};

export function SkeletonBlock({ height = 12, width = '100%', className }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity, height, width }} className={className}>
      <View className="h-full w-full rounded-full bg-bg-3" />
    </Animated.View>
  );
}
