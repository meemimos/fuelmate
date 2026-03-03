import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Card, Input } from '@fuelmate/ui';
import { useAlertsStore } from '@fuelmate/store';
import type { FuelType } from '@/data/mockStations';
import { MOCK_STATIONS } from '@/data/mockStations';

const FUEL_TYPES: FuelType[] = ['Unleaded', 'Premium', 'Diesel', 'E10'];

export default function AddAlertModal() {
  const params = useLocalSearchParams<{ stationName?: string; fuelType?: FuelType }>();
  const router = useRouter();
  const addAlert = useAlertsStore((state) => state.addAlert);

  const [fuelType, setFuelType] = useState<FuelType>(params.fuelType ?? 'Unleaded');
  const [stationName, setStationName] = useState<string | null>(params.stationName ?? null);
  const [threshold, setThreshold] = useState('');

  const stationOptions = useMemo(
    () => ['Any station', ...MOCK_STATIONS.map((station) => station.name)],
    []
  );

  const handleCreate = async () => {
    const thresholdValue = Number.parseFloat(threshold);
    if (Number.isNaN(thresholdValue)) {
      Alert.alert('Invalid threshold', 'Enter a valid number like 165.0');
      return;
    }
    try {
      await addAlert({
        fuel_type: fuelType,
        threshold_cents: thresholdValue,
        station_name: stationName,
        is_active: true,
      });
      router.back();
    } catch (error) {
      Alert.alert('Unable to create alert', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 py-8">
      <Text className="font-display text-2xl text-white">Add Alert</Text>
      <Text className="mt-2 font-body text-base text-muted">
        Configure price alerts for a station or fuel grade.
      </Text>

      <View className="mt-6 gap-4">
        <View className="gap-2">
          <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">
            Fuel type
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {FUEL_TYPES.map((type) => {
              const isActive = type === fuelType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setFuelType(type)}
                  className={`rounded-full border px-4 py-2 ${
                    isActive ? 'border-accent bg-accent/10' : 'border-border bg-bg-3'
                  }`}
                >
                  <Text
                    className={`font-mono text-[11px] uppercase tracking-[1.2px] ${
                      isActive ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Input
          label="Threshold"
          value={threshold}
          onChangeText={setThreshold}
          placeholder="e.g. 165.0"
          type="number"
          suffix={<Text className="text-xs text-muted">¢/L</Text>}
        />

        <View className="gap-2">
          <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">
            Station
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {stationOptions.map((option) => {
              const isActive = option === (stationName ?? 'Any station');
              return (
                <Pressable
                  key={option}
                  onPress={() => setStationName(option === 'Any station' ? null : option)}
                  className={`rounded-full border px-4 py-2 ${
                    isActive ? 'border-accent bg-accent/10' : 'border-border bg-bg-3'
                  }`}
                >
                  <Text
                    className={`font-mono text-[11px] uppercase tracking-[1.2px] ${
                      isActive ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Card variant="info">
          <Text className="text-sm text-white">
            You'll need to lock it yourself in My 7-Eleven.
          </Text>
        </Card>

        <Button variant="primary" size="md" fullWidth onPress={handleCreate}>
          Create Alert
        </Button>
      </View>
    </View>
  );
}
