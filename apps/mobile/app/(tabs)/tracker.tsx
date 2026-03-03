import { memo, useCallback, useEffect, useMemo } from 'react';
import { Alert, FlatList, ScrollView, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';

import { Badge, Button, Card, MoneyText, ScreenHeader } from '@fuelmate/ui';
import { useTrackerStore } from '@fuelmate/store';
import { SkeletonBlock } from '@/components/Skeleton';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

const formatMoney = (value: number) => value.toFixed(2);

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const HISTORY_ROW_HEIGHT = 112;
const MILESTONE_ROW_HEIGHT = 92;

const TrackerScreen = memo(function TrackerScreen() {
  const router = useRouter();
  const records = useTrackerStore((state) => state.records);
  const loading = useTrackerStore((state) => state.loading);
  const fetchRecords = useTrackerStore((state) => state.fetchRecords);

  useEffect(() => {
    fetchRecords().catch((error) =>
      Alert.alert(
        'Unable to load fill records',
        error instanceof Error ? error.message : 'Try again.'
      )
    );
  }, [fetchRecords]);

  const totalSaved = useMemo(
    () => records.reduce((sum, record) => sum + (record.saved_dollars ?? 0), 0),
    [records]
  );

  const monthTotal = useMemo(() => {
    const currentKey = getMonthKey(new Date());
    return records.reduce((sum, record) => {
      const recordKey = getMonthKey(new Date(record.filled_at));
      return recordKey === currentKey ? sum + (record.saved_dollars ?? 0) : sum;
    }, 0);
  }, [records]);

  const avgPerFill = records.length ? totalSaved / records.length : 0;

  const barData = useMemo(() => {
    const values = records.slice(0, 7).map((record) => record.saved_dollars ?? 0);
    while (values.length < 7) values.unshift(0);
    return values;
  }, [records]);

  const maxBar = Math.max(1, ...barData);

  const handleLogFill = useCallback(() => {
    router.push('/modal/log-fill');
  }, [router]);

  const milestones = useMemo(
    () => [
      {
        id: 'milestone-1',
        label: 'First Lock',
        done: records.length > 0,
        desc: records.length > 0 ? 'Completed' : 'Log your first fill',
      },
      {
        id: 'milestone-2',
        label: '$50 Saved',
        done: totalSaved >= 50,
        desc: `${formatMoney(totalSaved)} / 50`,
      },
      {
        id: 'milestone-3',
        label: '10 Fills',
        done: records.length >= 10,
        desc: `${records.length} / 10`,
      },
      {
        id: 'milestone-4',
        label: '$100 Saved',
        done: totalSaved >= 100,
        desc: `${formatMoney(totalSaved)} / 100`,
      },
    ],
    [records.length, totalSaved]
  );

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 pt-6">
          <ScreenHeader title="Savings Tracker" badge="..." />
          <Card variant="savings" className="mt-6">
            <SkeletonBlock height={12} width={180} />
            <SkeletonBlock height={48} className="mt-3" />
            <SkeletonBlock height={64} className="mt-4" />
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 pt-6">
        <ScreenHeader title="Savings Tracker" badge="All time" />

        <Card variant="savings" className="mt-6">
          <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-accent">
            Total saved with fuel locks
          </Text>
          <MoneyText value={totalSaved} size="xl" color="#00e5a0" />
          <View className="mt-5">
            <Svg height={64} width="100%">
              {barData.map((value, index) => {
                const height = Math.max(6, (value / maxBar) * 56);
                const x = index * 34;
                const y = 60 - height;
                const isLast = index === barData.length - 1;
                return (
                  <Rect
                    key={`bar-${index}`}
                    x={x}
                    y={y}
                    width={24}
                    height={height}
                    rx={8}
                    fill={isLast ? '#00e5a0' : '#2c2c36'}
                  />
                );
              })}
            </Svg>
          </View>
          <View className="mt-4 flex-row justify-between">
            <View>
              <MoneyText value={monthTotal} size="md" color="#00e5a0" />
              <Text className="text-xs text-muted">This month</Text>
            </View>
            <View>
              <Text className="text-[24px] font-display font-semibold text-white">
                {records.length}
              </Text>
              <Text className="text-xs text-muted">Total fills</Text>
            </View>
            <View>
              <MoneyText value={avgPerFill} size="md" color="#00e5a0" />
              <Text className="text-xs text-muted">Avg per fill</Text>
            </View>
          </View>
        </Card>

        <Card className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base text-white">Fill-up History</Text>
            <Badge variant="gray">{`${records.length} records`}</Badge>
          </View>
          {records.length === 0 ? (
            <View className="mt-5 rounded-xl border border-border/60 bg-bg-3 px-4 py-5">
              <Text className="text-sm text-white">No fill-ups yet.</Text>
              <Text className="mt-1 text-xs text-muted">Log your first fill to start tracking.</Text>
            </View>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="rounded-xl border border-border/60 bg-bg-3 px-4 py-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="h-2.5 w-2.5 rounded-full bg-accent" />
                      <View>
                        <Text className="text-sm font-medium text-white">{item.station_name}</Text>
                        <Text className="mt-1 text-[11px] text-muted">
                          {item.filled_at} · {item.fuel_type} · {item.locked_price_cents}¢ →{' '}
                          {item.pump_price_cents}¢ · {item.litres}L
                        </Text>
                      </View>
                    </View>
                    <MoneyText value={item.saved_dollars ?? 0} size="sm" color="#00e5a0" />
                  </View>
                </View>
              )}
              getItemLayout={(_, index) => ({
                length: HISTORY_ROW_HEIGHT,
                offset: HISTORY_ROW_HEIGHT * index,
                index,
              })}
              ItemSeparatorComponent={() => <View className="h-4" />}
              className="mt-4"
            />
          )}
        </Card>

        <Card className="mt-6">
          <Text className="font-display text-base text-white">Milestones</Text>
          <FlatList
            data={milestones}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="rounded-xl border border-border/60 bg-bg-3 px-4 py-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`h-8 w-8 items-center justify-center rounded-full ${
                        item.done ? 'bg-accent/20' : 'bg-border/30'
                      }`}
                    >
                      <Text className={`text-xs ${item.done ? 'text-accent' : 'text-muted'}`}>
                        {item.done ? '✓' : '🔒'}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm font-medium text-white">{item.label}</Text>
                      <Text className="mt-1 text-[11px] text-muted">{item.desc}</Text>
                    </View>
                  </View>
                  {item.done ? <Badge variant="green">Done</Badge> : null}
                </View>
              </View>
            )}
            getItemLayout={(_, index) => ({
              length: MILESTONE_ROW_HEIGHT,
              offset: MILESTONE_ROW_HEIGHT * index,
              index,
            })}
            ItemSeparatorComponent={() => <View className="h-3" />}
            className="mt-4"
          />
        </Card>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={handleLogFill}
        >
          Log a Fill-up
        </Button>
      </View>
    </ScrollView>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default TrackerScreen;
