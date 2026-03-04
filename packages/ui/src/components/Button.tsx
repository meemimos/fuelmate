import type { ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md';

export type ButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  accessibilityLabel?: string;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-black',
  secondary: 'bg-bg-3 text-white border border-border',
  danger: 'bg-red-500/90 text-white',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-black',
  secondary: 'text-white',
  danger: 'text-white',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-base',
};

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Button({
  children,
  onPress,
  variant,
  size,
  fullWidth,
  icon,
  className,
  accessibilityLabel,
}: ButtonProps) {
  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const baseClasses = cx(
    'items-center justify-center rounded-xl font-display font-semibold',
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    fullWidth ? 'w-full' : 'self-start',
    className
  );

  const content = (
    <View className="flex-row items-center gap-2">
      {icon}
      <Text className={cx('font-display font-semibold', TEXT_CLASSES[variant])}>{children}</Text>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <button
        type="button"
        onClick={handlePress}
        aria-label={accessibilityLabel}
        className={cx(baseClasses, 'transition-opacity hover:opacity-90 active:opacity-80')}
      >
        {content}
      </button>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={({ pressed }) => cx(baseClasses, pressed ? 'opacity-80' : undefined)}
    >
      {content}
    </Pressable>
  );
}
