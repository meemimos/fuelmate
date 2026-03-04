import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Badge, Button, Card, LedDisplay, MoneyText } from '@fuelmate/ui';
import { showToast } from '@fuelmate/lib';
import { useAlertsStore } from '@fuelmate/store';

type StationPayload = {
  name: string;
  address: string;
  distanceKm: number;
  distance?: number;
  unleaded: number;
  premium: number;
  diesel: number;
  e10: number;
};

type FuelKey = 'unleaded' | 'premium' | 'diesel' | 'e10';

export default function StationModal() {
  const { station: stationJson, fuelType } = useLocalSearchParams<{
    station?: string;
    fuelType?: FuelKey;
  }>();
  const router = useRouter();
  const alertsStore = useAlertsStore();

  const station = JSON.parse((stationJson ?? '{}') as string) as StationPayload;
  const price = station[fuelType ?? 'unleaded'] ?? 0;
  const save50L = Number((((190 - price) / 100) * 50).toFixed(2));
  const distance = station.distance ?? station.distanceKm ?? 0;
  const fuelKey = fuelType ?? 'unleaded';

  return (
    <ScrollView className="flex-1 bg-bg px-6 pt-6" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="font-display text-xl font-bold tracking-tight text-white">
        {station.name}
      </Text>
      <Text className="mb-4 mt-1 font-mono text-xs text-muted-foreground">
        {station.address} · {distance} km away
      </Text>

      <View className="flex-row items-center">
        <LedDisplay value={price.toFixed(1)} height={56} color="#ff6b00" />
        <Text className="ml-1 mb-2 self-end font-mono text-xs text-muted-foreground">¢/L</Text>
        <View className="flex-1" />
        <View className="items-end">
          <Text className="font-mono text-[10px] text-muted-foreground">save on 50L fill</Text>
          <MoneyText value={save50L} size="lg" color="#00e5a0" />
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <Badge variant="green">{fuelKey}</Badge>
        <Badge variant="blue">{distance} km</Badge>
      </View>

      <Text className="mb-3 mt-4 font-display text-xs font-semibold text-white">
        All fuel prices
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {(['unleaded', 'premium', 'diesel', 'e10'] as FuelKey[]).map((key) => {
          const isActive = key === fuelKey;
          const label = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          return (
            <Card
              key={key}
              className={`mb-3 w-[48%] ${
                isActive ? 'border-fuel/30' : 'border-border'
              }`}
            >
              <LedDisplay
                value={(station[key] ?? 0).toFixed(1)}
                height={24}
                color={isActive ? '#ff6b00' : '#1a5a3a'}
                dimColor={isActive ? 'rgba(255,107,0,0.06)' : 'rgba(0,40,20,0.12)'}
              />
              <Text className="mt-1.5 font-mono text-[10px] text-muted-foreground">{label}</Text>
            </Card>
          );
        })}
      </View>

      <Card variant="savings" className="mt-4">
        <Text className="mb-2 font-mono text-xs text-muted-foreground">💡 Lock tip</Text>
        <Text className="font-body text-sm leading-relaxed text-white">
          Open your My 7-Eleven app → Fuel Lock → this station shows {price.toFixed(1)} ¢/L. Lock
          it in and you'll have 7 days to fill up.
        </Text>
      </Card>

      <View className="mt-4">
        <Button
          variant="primary"
          size="md"
          fullWidth
          icon="bell"
          onPress={() => {
            alertsStore.addAlert({ fuelType: fuelKey, threshold: price - 2, station: station.name });
            showToast(`Alert set for ${station.name}`, 'success');
            router.back();
          }}
        >
          Set Alert for This Station
        </Button>
      </View>
    </ScrollView>
  );
}
