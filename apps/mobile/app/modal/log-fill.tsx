import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input, MoneyText } from '@fuelmate/ui';
import { MOCK_STATIONS, showToast } from '@fuelmate/lib';
import { useTrackerStore } from '@fuelmate/store';

const FUEL_TYPES = ['Unleaded', 'Premium', 'Diesel', 'E10'] as const;

export default function LogFillModal() {
  const router = useRouter();
  const { addRecord } = useTrackerStore();
  const [form, setForm] = useState({
    station: MOCK_STATIONS[0].name,
    fuelType: 'Unleaded',
    lockedPrice: '',
    pumpPrice: '',
    litres: '',
  });

  const locked = Number.parseFloat(form.lockedPrice);
  const pump = Number.parseFloat(form.pumpPrice);
  const litres = Number.parseFloat(form.litres);

  const saved = form.lockedPrice && form.pumpPrice && form.litres
    ? Math.max(0, ((pump - locked) / 100) * litres).toFixed(2)
    : null;

  const pumpError = form.pumpPrice.length > 0 && form.lockedPrice.length > 0 && !(pump > locked)
    ? 'Pump price must be higher than locked price'
    : undefined;
  const litresError = form.litres.length > 0 && (Number.isNaN(litres) || litres < 1 || litres > 150)
    ? 'Litres must be between 1 and 150'
    : undefined;

  const handleSave = async () => {
    if (!form.lockedPrice || !form.pumpPrice || !form.litres) return;
    if (pumpError || litresError) return;

    await addRecord({
      station_name: form.station,
      fuel_type: form.fuelType,
      locked_price_cents: parseFloat(form.lockedPrice),
      pump_price_cents: parseFloat(form.pumpPrice),
      litres: parseFloat(form.litres),
      saved_dollars: parseFloat(saved ?? '0'),
      filled_at: new Date().toISOString().split('T')[0],
    });

    showToast(`$${saved} saving logged!`, 'success');
    router.back();
  };

  const stationOptions = useMemo(() => MOCK_STATIONS.map((s) => s.name), []);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-bg">
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 py-8">
          <Text className="mb-1 font-display text-xl font-bold tracking-tight text-white">Log a Fill-up</Text>
          <Text className="mb-5 font-mono text-xs text-muted">Record your savings after using a fuel lock</Text>

          <View className="mb-4 gap-2">
            <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">Station</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {stationOptions.map((option) => (
                <Button key={option} variant={form.station === option ? 'primary' : 'secondary'} size="sm" accessibilityLabel={`Select station ${option}`} onPress={() => setForm((f) => ({ ...f, station: option }))}>
                  {option}
                </Button>
              ))}
            </ScrollView>
          </View>

          <View className="mb-4 gap-2">
            <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">Fuel Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {FUEL_TYPES.map((option) => (
                <Button key={option} variant={form.fuelType === option ? 'primary' : 'secondary'} size="sm" accessibilityLabel={`Select fuel ${option}`} onPress={() => setForm((f) => ({ ...f, fuelType: option }))}>
                  {option}
                </Button>
              ))}
            </ScrollView>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Locked Price (¢)" value={form.lockedPrice} onChangeText={(v) => setForm((f) => ({ ...f, lockedPrice: v }))} type="number" placeholder="158.9" />
            </View>
            <View className="flex-1">
              <Input label="Pump Price (¢)" value={form.pumpPrice} onChangeText={(v) => setForm((f) => ({ ...f, pumpPrice: v }))} type="number" placeholder="179.9" error={pumpError} />
            </View>
          </View>

          <View className="mt-4">
            <Input label="Litres filled" value={form.litres} onChangeText={(v) => setForm((f) => ({ ...f, litres: v }))} type="number" placeholder="45" error={litresError} />
          </View>

          {saved !== null ? (
            <Card variant="savings" className="mb-4 mt-4">
              <Text className="mb-2 font-mono text-xs text-muted">Estimated saving</Text>
              <MoneyText value={Number(saved)} size="xl" color="#00e5a0" />
            </Card>
          ) : null}

          <Button variant="primary" size="md" fullWidth accessibilityLabel="Save fill-up record" icon={<Text className="text-black">✓</Text>} onPress={handleSave}>
            Save Record
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
