import { memo, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Button, Card, MoneyText, OfflineBanner, ScreenHeader, Skeleton } from '@fuelmate/ui';
import { useTrackerStore } from '@fuelmate/store';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

const TrackerScreen = memo(function TrackerScreen() {
  const router = useRouter();
  const { records, loading, fetchRecords, monthTotal } = useTrackerStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const totalR = records.reduce((s, r) => s + (r.saved_dollars ?? 0), 0);
  const chartVals = [3.2, 5.6, 9.4, 7.1, 12.3, 8.9, Math.min(totalR / 5 || 6.4, 15)];
  const maxBar = Math.max(...chartVals);

  const milestones = [
    { label: 'First Lock', done: records.length > 0, desc: 'Locked your first fuel price' },
    { label: '$50 Saved', done: totalR >= 50, desc: `$${totalR.toFixed(2)} / $50.00` },
    { label: '10 Fills', done: records.length >= 10, desc: `${records.length} / 10 fill-ups logged` },
    { label: '$100 Saved', done: totalR >= 100, desc: `$${totalR.toFixed(2)} / $100.00` },
  ];

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00e5a0" />}
    >
      <OfflineBanner />
      <View className="px-6 pt-6">
        <ScreenHeader title="Savings Tracker" badge="All time" />

        {loading ? (
          <View className="py-2">
            {[0, 1, 2].map((i) => (
              <Card key={`t-s-${i}`} className="mb-2">
                <Skeleton height={14} />
                <Skeleton height={10} className="mt-2" width="70%" />
              </Card>
            ))}
          </View>
        ) : null}

        <Card variant="savings" className="mb-3 mt-6">
          <Text className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">TOTAL SAVED WITH FUEL LOCKS</Text>
          <MoneyText value={Number(totalR.toFixed(2))} size="xl" color="#00e5a0" />

          <View className="mb-1 mt-4 h-12 flex-row items-end gap-1">
            {chartVals.map((v, i) => (
              <View key={`bar-${i}`} style={{ flex: 1, height: `${(v / maxBar) * 100}%`, minHeight: 4, borderRadius: 3, backgroundColor: i === 6 ? '#00e5a0' : '#1a1a1f', borderWidth: i === 6 ? 0 : 1, borderColor: '#252530' }} />
            ))}
          </View>

          <View className="flex-row justify-between">
            <Text className="font-mono text-[9px] text-muted">6w ago</Text>
            <Text className="font-mono text-[9px] text-muted">Now</Text>
          </View>

          <View className="mt-3 flex-row gap-4">
            <View className="flex-1">
              <MoneyText value={Number(monthTotal.toFixed(2))} size="md" color="#00e5a0" />
              <Text className="font-mono text-[10px] text-muted">This month</Text>
            </View>
            <View className="flex-1">
              <Text className="font-display text-xl font-bold tracking-tight text-white">{records.length}</Text>
              <Text className="font-mono text-[10px] text-muted">Total fills</Text>
            </View>
            <View className="flex-1">
              <MoneyText value={Number((totalR / Math.max(records.length, 1)).toFixed(2))} size="md" color="#00e5a0" />
              <Text className="font-mono text-[10px] text-muted">Avg per fill</Text>
            </View>
          </View>
        </Card>

        <Card className="mb-3">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-display text-sm font-semibold text-white">Fill-up History</Text>
            <Badge variant="gray">{records.length} entries</Badge>
          </View>

          {records.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-4xl">⛽</Text>
              <Text className="py-1 text-center font-body text-sm text-muted">No fill-ups logged</Text>
              <Text className="text-center font-body text-sm text-muted">Log your first fill-up below</Text>
            </View>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="flex-row items-start gap-2.5 border-b border-border py-3 last:border-0">
                  <View className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                  <View className="flex-1">
                    <Text className="font-body text-xs font-medium text-white">{item.station_name}</Text>
                    <Text className="mt-0.5 font-mono text-[10px] text-muted">{item.filled_at} · {item.fuel_type} · {item.locked_price_cents}¢ locked vs {item.pump_price_cents}¢ pump · {item.litres}L</Text>
                  </View>
                  <MoneyText value={Math.abs(item.saved_dollars ?? 0)} size="sm" color="#00e5a0" showSign />
                </View>
              )}
            />
          )}
        </Card>

        <Card className="mb-3">
          <Text className="mb-1 font-display text-sm font-semibold text-white">Milestones</Text>
          {milestones.map((m) => (
            <View key={m.label} className="flex-row items-center gap-3 border-b border-border py-2.5 last:border-0">
              <View className={`h-8 w-8 rounded-xl border items-center justify-center ${m.done ? 'border-accent/30 bg-accent/12' : 'border-border bg-bg-3'}`}>
                <Text style={{ color: m.done ? '#00e5a0' : '#9898a8' }}>{m.done ? '✓' : '🔒'}</Text>
              </View>
              <View className="flex-1">
                <Text className={`font-body text-sm ${m.done ? 'font-medium text-white' : 'text-muted'}`}>{m.label}</Text>
                <Text className="mt-0.5 font-mono text-[10px] text-muted">{m.desc}</Text>
              </View>
              {m.done ? <Badge variant="green">Done</Badge> : null}
            </View>
          ))}
        </Card>

        <Button variant="primary" size="md" fullWidth accessibilityLabel="Log fill-up" icon={<Text className="text-black">＋</Text>} onPress={() => router.push('/modal/log-fill')}>
          Log a Fill-up
        </Button>
      </View>
    </ScrollView>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default TrackerScreen;
