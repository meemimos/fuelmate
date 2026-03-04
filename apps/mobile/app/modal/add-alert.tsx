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
        <View className="px-6 py-8">
          <Text className="mb-1 font-display text-xl font-bold tracking-tight text-white">New Price Alert</Text>
          <Text className="mb-5 font-mono text-xs text-muted">Get notified when fuel drops below your target</Text>

          <View className="mb-4 gap-2">
            <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">Fuel Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {FUEL_TYPES.map((option) => {
                const active = option === fuelType;
                return (
                  <Button key={option} variant={active ? 'primary' : 'secondary'} size="sm" accessibilityLabel={`Select ${option}`} onPress={() => setFuelType(option)}>
                    {option}
                  </Button>
                );
              })}
            </ScrollView>
          </View>

          <View className="mb-4">
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

          <View className="mb-5 gap-2">
            <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">Station</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {stationOptions.map((option) => {
                const active = option === station;
                return (
                  <Button key={option} variant={active ? 'primary' : 'secondary'} size="sm" accessibilityLabel={`Select station ${option}`} onPress={() => setStation(option)}>
                    {option}
                  </Button>
                );
              })}
            </ScrollView>
          </View>

          <Card variant="savings" className="mb-5">
            <Text className="font-body text-xs leading-relaxed text-muted">📲 When triggered, open your My 7-Eleven app to lock in the price yourself.</Text>
          </Card>

          <Button variant="primary" size="md" fullWidth accessibilityLabel="Create alert" onPress={handleCreate}>
            Create Alert
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
