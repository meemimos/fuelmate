import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input } from '@fuelmate/ui';
import { useTrackerStore } from '@fuelmate/store';
import type { FuelType } from '@/data/mockStations';
import { MOCK_STATIONS } from '@/data/mockStations';

const FUEL_TYPES: FuelType[] = ['Unleaded', 'Premium', 'Diesel', 'E10'];

const calcSaved = (locked: number, pump: number, litres: number) =>
  Math.max(0, Math.min(((pump - locked) / 100) * litres, 0.25 * litres));

export default function LogFillModal() {
  const router = useRouter();
  const addRecord = useTrackerStore((state) => state.addRecord);
  const [stationName, setStationName] = useState<string | null>(null);
  const [fuelType, setFuelType] = useState<FuelType>('Unleaded');
  const [lockedPrice, setLockedPrice] = useState('');
  const [pumpPrice, setPumpPrice] = useState('');
  const [litres, setLitres] = useState('');

  const stationOptions = useMemo(
    () => ['Select station', ...MOCK_STATIONS.map((station) => station.name)],
    []
  );

  const numericLocked = Number.parseFloat(lockedPrice);
  const numericPump = Number.parseFloat(pumpPrice);
  const numericLitres = Number.parseFloat(litres);
  const canPreview =
    !Number.isNaN(numericLocked) && !Number.isNaN(numericPump) && !Number.isNaN(numericLitres);
  const estimatedSaving = canPreview
    ? calcSaved(numericLocked, numericPump, numericLitres)
    : 0;

  const handleSave = async () => {
    if (!stationName) {
      Alert.alert('Pick a station', 'Select the station where you filled up.');
      return;
    }
    if (!canPreview) {
      Alert.alert('Missing details', 'Fill in all prices and litres.');
      return;
    }
    try {
      await addRecord({
        station_name: stationName,
        fuel_type: fuelType,
        locked_price_cents: numericLocked,
        pump_price_cents: numericPump,
        litres: numericLitres,
        filled_at: new Date().toISOString().slice(0, 10),
      });
      Alert.alert('Saved', 'Your fill-up was added.');
      router.back();
    } catch (error) {
      Alert.alert('Unable to save', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 py-8">
        <Text className="font-display text-2xl text-white">Log Fill</Text>
        <Text className="mt-2 font-body text-base text-muted">
          Record fill-ups, pricing, and odometer readings here.
        </Text>

        <View className="mt-6 gap-4">
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
                const isActive = option === (stationName ?? 'Select station');
                return (
                  <Pressable
                    key={option}
                    onPress={() => setStationName(option === 'Select station' ? null : option)}
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

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Locked price"
                value={lockedPrice}
                onChangeText={setLockedPrice}
                placeholder="e.g. 158.9"
                type="number"
                suffix={<Text className="text-xs text-muted">¢</Text>}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Pump price"
                value={pumpPrice}
                onChangeText={setPumpPrice}
                placeholder="e.g. 168.2"
                type="number"
                suffix={<Text className="text-xs text-muted">¢</Text>}
              />
            </View>
          </View>

          <Input
            label="Litres"
            value={litres}
            onChangeText={setLitres}
            placeholder="e.g. 42.5"
            type="number"
          />

          {canPreview ? (
            <Card variant="savings">
              <Text className="text-sm text-white">Estimated saving</Text>
              <View className="mt-2">
                <Text className="text-[48px] font-money text-accent">
                  ${estimatedSaving.toFixed(2)}
                </Text>
              </View>
            </Card>
          ) : null}

          <Button variant="primary" size="md" fullWidth onPress={handleSave}>
            Save Record
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
