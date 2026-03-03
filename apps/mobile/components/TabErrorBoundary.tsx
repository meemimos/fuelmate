import { Text, View } from 'react-native';
import { Button } from '@fuelmate/ui';

type Props = {
  error: Error;
  retry: () => void;
};

export function TabErrorBoundary({ error, retry }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-xl font-display font-semibold text-white">Something broke</Text>
      <Text className="mt-2 text-center text-xs text-muted">{error.message}</Text>
      <Button variant="primary" size="md" onPress={retry} fullWidth>
        Try again
      </Button>
    </View>
  );
}
