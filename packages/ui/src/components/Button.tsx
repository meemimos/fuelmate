import type { ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  accessibilityLabel?: string;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-white text-black hover:bg-gray-100',
  secondary: 'bg-bg-3 text-white border border-border hover:bg-bg-2',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-accent border border-accent/50 hover:bg-accent/10',
  accent: 'bg-accent text-black hover:bg-accent/90',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-black',
  secondary: 'text-white',
  danger: 'text-white',
  ghost: 'text-accent',
  accent: 'text-black',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
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
