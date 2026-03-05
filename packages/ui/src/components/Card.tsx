import type { ReactNode } from 'react';
import { View } from 'react-native';

type CardVariant = 'default' | 'fuel' | 'savings' | 'info';

export type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
};

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'border-border bg-bg-2',
  fuel: 'border-fuel/20 bg-fuel/5',
  savings: 'border-accent/20 bg-accent/5',
  info: 'border-blue-500/20 bg-blue-500/5',
};

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <View
      className={cx('rounded-2xl border p-5 shadow-sm shadow-black/40', VARIANT_CLASSES[variant], className)}
    >
      {children}
    </View>
  );
}
