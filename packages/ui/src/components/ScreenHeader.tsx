import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Badge } from './Badge';

export type ScreenHeaderProps = {
  title: string;
  badge?: string;
  rightElement?: ReactNode;
};

export function ScreenHeader({ title, badge, rightElement }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="gap-2">
        <Text className="text-[20px] font-display font-semibold tracking-tight text-white">
          {title}
        </Text>
        {badge ? <Badge variant="gray">{badge}</Badge> : null}
      </View>
      {rightElement ? <View>{rightElement}</View> : null}
    </View>
  );
}
