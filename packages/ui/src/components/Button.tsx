import type { ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
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
  disabled?: boolean;
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-5',
};

const variantViewStyle: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: '#ffffff' },
  secondary: { backgroundColor: '#1a1a1f', borderWidth: 1, borderColor: '#252530' },
  danger: { backgroundColor: '#dc2626' },
  ghost: { backgroundColor: '#1a1a1f', borderWidth: 1, borderColor: '#00e5a088' },
  accent: { backgroundColor: '#00e5a0' },
};

const variantTextStyle: Record<ButtonVariant, TextStyle> = {
  primary: { color: '#000000' },
  secondary: { color: '#ffffff' },
  danger: { color: '#ffffff' },
  ghost: { color: '#00e5a0' },
  accent: { color: '#000000' },
};

const sizeTextClass: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
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
  disabled,
}: ButtonProps) {
  const handlePress = async () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const baseClasses = cx(
    'items-center justify-center rounded-xl',
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : 'self-start',
    className
  );

  const pressableStyle = ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => [
    variantViewStyle[variant],
    disabled ? { opacity: 0.55 } : pressed ? { opacity: 0.8 } : null,
  ];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={baseClasses}
      style={pressableStyle}
    >
      <View className="flex-row items-center gap-2">
        {icon}
        <Text
          className={cx('font-display font-semibold', sizeTextClass[size])}
          style={variantTextStyle[variant]}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}
