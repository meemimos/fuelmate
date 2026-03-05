import type { ReactNode } from 'react';
import { Text } from 'react-native';

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

export type BadgeProps = {
  children: ReactNode;
  variant: BadgeVariant;
  className?: string;
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green: 'border-accent/30 text-accent bg-accent/10',
  amber: 'border-amber-400/30 text-amber-300 bg-amber-400/10',
  red: 'border-red-500/30 text-red-400 bg-red-500/10',
  blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  gray: 'border-border/80 text-muted bg-border/20',
};

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <Text
      className={cx(
        'self-start rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[1.2px]',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </Text>
  );
}
