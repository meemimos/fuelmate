import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
};

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 10,
  className,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity, width, height, borderRadius }}>
      <View className={`h-full w-full bg-bg-3 ${className ?? ''}`} style={{ borderRadius }} />
    </Animated.View>
  );
}
