import NetInfo from '@react-native-community/netinfo';
import { Text, View } from 'react-native';

export function OfflineBanner() {
  const { isConnected } = NetInfo.useNetInfo();

  if (isConnected !== false) return null;

  return (
    <View className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2">
      <Text className="font-mono text-xs text-amber-400">
        No connection — showing cached data
      </Text>
    </View>
  );
}
