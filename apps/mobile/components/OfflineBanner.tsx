import { Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function OfflineBanner() {
  const { isConnected } = NetInfo.useNetInfo();

  if (isConnected !== false) {
    return null;
  }

  return (
    <View className="bg-red-500 px-4 py-2">
      <Text className="text-center text-xs font-semibold text-white">
        You are offline. Some data may be outdated.
      </Text>
    </View>
  );
}
