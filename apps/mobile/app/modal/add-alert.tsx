import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input } from '@fuelmate/ui';
import { MOCK_STATIONS, showToast } from '@fuelmate/lib';
import { useAlertsStore } from '@fuelmate/store';

const FUEL_TYPES = ['Unleaded', 'Premium', 'Diesel', 'E10'] as const;

export default function AddAlertModal() {
  const router = useRouter();
  const { addAlert } = useAlertsStore();

  const [fuelType, setFuelType] = useState('Unleaded');
  const [threshold, setThreshold] = useState('');
  const [station, setStation] = useState('Any 7-Eleven');

  const stationOptions = useMemo(() => ['Any 7-Eleven', ...MOCK_STATIONS.map((s) => s.name)], []);
  const thresholdNum = Number.parseFloat(threshold);
  const thresholdError = threshold.length > 0 && (Number.isNaN(thresholdNum) || thresholdNum < 100 || thresholdNum > 250)
    ? 'Threshold must be between 100 and 250'
    : undefined;

  const handleCreate = async () => {
    if (!threshold || thresholdError) return;

    await addAlert({
      fuel_type: fuelType,
      threshold_cents: parseFloat(threshold),
      station_name: station === 'Any 7-Eleven' ? null : station,
    });

    showToast('Alert created!', 'success');
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-bg">
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 py-10">
          <View>
            <Text className="mb-1 font-display text-3xl font-bold text-white">New Price Alert</Text>
            <Text className="font-body text-sm text-muted">Get notified when fuel drops below your target</Text>
          </View>

          <View className="mt-8 gap-5">
            <View className="gap-3">
              <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">Fuel Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {FUEL_TYPES.map((option) => {
                  const active = option === fuelType;
                  return (
                    <Button key={option} variant={active ? 'accent' : 'secondary'} size="sm" accessibilityLabel={`Select ${option}`} onPress={() => setFuelType(option)}>
                      {option}
                    </Button>
                  );
                })}
              </ScrollView>
            </View>

            <View>
              <Input
                label="Alert me when price drops below"
                value={threshold}
                onChangeText={setThreshold}
                type="number"
                placeholder="e.g. 165.0"
                suffix={<Text className="text-xs text-muted">¢/L</Text>}
                error={thresholdError}
              />
            </View>

            <View className="gap-3">
              <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">Station</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {stationOptions.map((option) => {
                  const active = option === station;
                  return (
                    <Button key={option} variant={active ? 'accent' : 'secondary'} size="sm" accessibilityLabel={`Select station ${option}`} onPress={() => setStation(option)}>
                      {option}
                    </Button>
                  );
                })}
              </ScrollView>
            </View>

            <Card variant="info" className="mt-2">
              <Text className="font-body text-xs leading-relaxed text-muted">📲 When triggered, open your My 7-Eleven app to lock in the price yourself.</Text>
            </Card>

            <Button variant="accent" size="lg" fullWidth accessibilityLabel="Create alert" onPress={handleCreate}>
              Create Alert
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
