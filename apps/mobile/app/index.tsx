import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function WebHome() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b1220' }}>
      <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 10 }}>FuelMate</Text>
      <Text style={{ color: '#9ca3af', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
        Web demo is live. Continue to auth flow or tabs.
      </Text>
      <Link href="/(auth)/welcome" style={{ color: '#60a5fa', marginBottom: 10 }}>Go to Welcome</Link>
      <Link href="/(tabs)/prices" style={{ color: '#34d399' }}>Go to Prices</Link>
    </View>
  );
}
