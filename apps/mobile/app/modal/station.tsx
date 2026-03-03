import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Badge, Button, Card, LedDisplay, MoneyText } from '@fuelmate/ui';
import type { FuelType } from '@/data/mockStations';
import { MOCK_STATIONS } from '@/data/mockStations';

const FUEL_TYPES: FuelType[] = ['Unleaded', 'Premium', 'Diesel', 'E10'];

const formatPrice = (value: number) => value.toFixed(1);

const calcSaveFor50L = (high: number, low: number) =>
  Math.max(0, ((high - low) / 100) * 50);

export default function StationModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ stationId?: string; fuelType?: FuelType }>();
  const fuelType = params.fuelType ?? 'Unleaded';
  const station = useMemo(
    () => MOCK_STATIONS.find((item) => item.id === params.stationId) ?? MOCK_STATIONS[0],
    [params.stationId]
  );

  const prices = FUEL_TYPES.map((type) => station.fuels[type]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const save50L = calcSaveFor50L(maxPrice, minPrice);

  return (
    <View className="flex-1 bg-bg px-6 pt-6">
      <View className="gap-1">
        <Text className="text-lg font-display font-semibold text-white">{station.name}</Text>
        <Text className="text-xs text-muted">{station.address}</Text>
      </View>

      <View className="mt-6 flex-row items-center justify-between">
        <LedDisplay value={formatPrice(station.fuels[fuelType])} height={56} color="#ff6b00" />
        <View className="items-end">
          <Text className="text-xs text-muted">Save 50L</Text>
          <MoneyText value={save50L} size="lg" />
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap gap-2">
        {FUEL_TYPES.map((type) => (
          <Badge key={type} variant={type === fuelType ? 'green' : 'gray'}>
            {type}
          </Badge>
        ))}
      </View>

      <View className="mt-6 flex-row flex-wrap gap-3">
        {FUEL_TYPES.map((type) => {
          const isActive = type === fuelType;
          return (
            <Pressable
              key={type}
              className={`w-[48%] rounded-xl border px-3 py-3 ${
                isActive ? 'border-fuel/40 bg-fuel/5' : 'border-border bg-bg-3'
              }`}
            >
              <Text className="text-[10px] font-mono uppercase tracking-[1.2px] text-muted">
                {type}
              </Text>
              <LedDisplay value={formatPrice(station.fuels[type])} height={24} color="#ff6b00" />
            </Pressable>
          );
        })}
      </View>

      <Card variant="savings" className="mt-6">
        <Text className="text-xs text-muted">Lock tip</Text>
        <Text className="mt-2 text-sm text-white">
          Open your My 7-Eleven app → Fuel Lock → {station.name} shows{' '}
          {formatPrice(station.fuels[fuelType])} ¢/L
        </Text>
      </Card>

      <View className="mt-6">
        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={() =>
            router.push({
              pathname: '/modal/add-alert',
              params: { stationName: station.name, fuelType },
            })
          }
        >
          Set Alert for This Station
        </Button>
      </View>
    </View>
  );
}
