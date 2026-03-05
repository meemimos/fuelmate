import { Text } from 'react-native';

type MoneySize = 'sm' | 'md' | 'lg' | 'xl';

export type MoneyTextProps = {
  value: number;
  size?: MoneySize;
  color?: string;
  showSign?: boolean;
};

const SIZE_MAP: Record<MoneySize, number> = {
  sm: 16,
  md: 22,
  lg: 32,
  xl: 52,
};

export function MoneyText({ value, size = 'md', color = '#ffffff', showSign }: MoneyTextProps) {
  const sign = value < 0 ? '-' : showSign ? '+' : '';
  const formatted = Math.abs(value).toFixed(2);

  return (
    <Text
      className="font-money text-white"
      style={{ fontSize: SIZE_MAP[size], color }}
      accessibilityLabel={`$${formatted}`}
    >
      {`${sign}$${formatted}`}
    </Text>
  );
}
