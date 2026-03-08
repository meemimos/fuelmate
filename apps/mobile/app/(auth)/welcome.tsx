import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, LedDisplay, MoneyText } from '@fuelmate/ui';

export default function WelcomeScreen() {
  const router = useRouter();
  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [glow]);

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Animated.View style={{ opacity: glow, transform: [{ scale: glow }] }}>
        <LedDisplay value="158.9" height={64} />
      </Animated.View>
      <View className="mt-6 flex-row items-baseline">
        <Text className="font-body text-base text-muted">Save </Text>
        <MoneyText value={47.21} size="lg" />
        <Text className="font-body text-base text-muted"> this month</Text>
      </View>
      <Text className="mt-10 text-[32px] font-display font-semibold tracking-tight text-white">
        FuelMate
      </Text>
      <Text className="mt-2 text-center font-body text-base text-muted">
        Know when to lock. Track what you save.
      </Text>
      <View className="mt-10 w-full gap-3">
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
        >
          Get Started
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
        >
          I have an account
        </Button>
      </View>
    </View>
  );
}
