import { memo, useCallback, useEffect } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Button, Card, ScreenHeader } from '@fuelmate/ui';
import { useAlertsStore } from '@fuelmate/store';
import { SkeletonBlock } from '@/components/Skeleton';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

type Trigger = {
  id: string;
  station: string;
  fuel: string;
  price: string;
  timeAgo: string;
};

const MOCK_TRIGGERS: Trigger[] = [
  {
    id: 'trigger-1',
    station: '7-Eleven Surry Hills',
    fuel: 'Unleaded',
    price: '158.9¢/L',
    timeAgo: '12m ago',
  },
  {
    id: 'trigger-2',
    station: 'BP Broadway',
    fuel: 'Diesel',
    price: '171.2¢/L',
    timeAgo: '1h ago',
  },
];

const formatThreshold = (value: number) => `${value.toFixed(1)}¢/L`;

const ALERT_ROW_HEIGHT = 108;
const TRIGGER_ROW_HEIGHT = 84;

const AlertsScreen = memo(function AlertsScreen() {
  const router = useRouter();
  const alerts = useAlertsStore((state) => state.alerts);
  const loading = useAlertsStore((state) => state.loading);
  const fetchAlerts = useAlertsStore((state) => state.fetchAlerts);
  const toggleAlert = useAlertsStore((state) => state.toggleAlert);
  const deleteAlert = useAlertsStore((state) => state.deleteAlert);

  useEffect(() => {
    fetchAlerts().catch((error) =>
      Alert.alert('Unable to load alerts', error instanceof Error ? error.message : 'Try again.')
    );
  }, [fetchAlerts]);

  const activeCount = alerts.filter((alert) => alert.is_active).length;

  const handleNewAlert = useCallback(() => {
    router.push('/modal/add-alert');
  }, [router]);

  const handleToggle = useCallback(
    async (id: string, nextActive: boolean) => {
      try {
        await toggleAlert(id, nextActive);
      } catch (error) {
        Alert.alert('Unable to update alert', error instanceof Error ? error.message : 'Try again.');
      }
    },
    [toggleAlert]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteAlert(id);
      } catch (error) {
        Alert.alert('Unable to delete alert', error instanceof Error ? error.message : 'Try again.');
      }
    },
    [deleteAlert]
  );

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 pt-6">
          <ScreenHeader title="Price Alerts" badge="..." />
          <Card variant="info" className="mt-6">
            <SkeletonBlock height={12} />
            <SkeletonBlock height={12} className="mt-2" />
          </Card>
          <Card className="mt-6">
            <SkeletonBlock height={14} width={120} />
            <View className="mt-4 gap-4">
              {[0, 1, 2].map((item) => (
                <View key={`alert-skeleton-${item}`} className="rounded-xl border border-border/60 bg-bg-3 px-4 py-4">
                  <SkeletonBlock height={12} width={180} />
                  <SkeletonBlock height={10} width={120} className="mt-2" />
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 pt-6">
        <ScreenHeader title="Price Alerts" badge={`${activeCount} active`} />

        <Card variant="info" className="mt-6">
          <Text className="text-sm text-white">
            We monitor 7-Eleven prices. When a station hits your target, you're notified to lock it
            in the My 7-Eleven app yourself.
          </Text>
        </Card>

        <Card className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base text-white">Your Alerts</Text>
            <Badge variant="gray">{`${alerts.length} total`}</Badge>
          </View>

          {alerts.length === 0 ? (
            <View className="mt-6 rounded-xl border border-border/70 bg-bg-3 px-4 py-6">
              <Text className="text-sm text-white">No alerts yet.</Text>
              <Text className="mt-2 text-xs text-muted">
                Create one to get notified when prices drop.
              </Text>
            </View>
          ) : (
            <FlatList
              data={alerts}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <AlertRow
                  id={item.id}
                  fuelType={item.fuel_type}
                  threshold={item.threshold_cents}
                  stationName={item.station_name}
                  isActive={item.is_active}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              )}
              getItemLayout={(_, index) => ({
                length: ALERT_ROW_HEIGHT,
                offset: ALERT_ROW_HEIGHT * index,
                index,
              })}
              ItemSeparatorComponent={() => <View className="h-4" />}
              className="mt-4"
            />
          )}
        </Card>

        <Card className="mt-6">
          <Text className="font-display text-base text-white">Recent Triggers</Text>
          <FlatList
            data={MOCK_TRIGGERS}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="rounded-xl border border-border/60 bg-bg-3 px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-white">{item.station}</Text>
                    <Text className="mt-1 text-xs text-muted">
                      {item.fuel} · {item.price}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-accent">OK</Text>
                    <Text className="mt-1 text-[10px] text-muted">{item.timeAgo}</Text>
                  </View>
                </View>
              </View>
            )}
            getItemLayout={(_, index) => ({
              length: TRIGGER_ROW_HEIGHT,
              offset: TRIGGER_ROW_HEIGHT * index,
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
          onPress={handleNewAlert}
        >
          New Price Alert
        </Button>
      </View>
    </ScrollView>
  );
});

type AlertRowProps = {
  fuelType: string;
  threshold: number;
  stationName: string | null;
  isActive: boolean;
  id: string;
  onToggle: (id: string, nextActive: boolean) => void;
  onDelete: (id: string) => void;
};

const AlertRow = memo(function AlertRow({
  id,
  fuelType,
  threshold,
  stationName,
  isActive,
  onToggle,
  onDelete,
}: AlertRowProps) {
  const handleToggle = useCallback(() => onToggle(id, !isActive), [id, isActive, onToggle]);
  const handleDelete = useCallback(() => onDelete(id), [id, onDelete]);

  return (
    <View className="rounded-xl border border-border/60 bg-bg-3 px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isActive ? 'bg-accent/15' : 'bg-amber-400/15'
            }`}
          >
            <Text className={`${isActive ? 'text-accent' : 'text-amber-300'} font-mono text-xs`}>
              {isActive ? 'ON' : 'PAUSE'}
            </Text>
          </View>
          <View>
            <Text className="text-[13px] font-medium text-white">
              {fuelType} · Under {formatThreshold(threshold)}
            </Text>
            <Text className="mt-1 text-[11px] text-muted">
              {stationName ?? 'Any station'}
            </Text>
          </View>
        </View>
        <View className="items-end gap-2">
          <Badge variant={isActive ? 'green' : 'amber'}>{isActive ? 'Active' : 'Paused'}</Badge>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleToggle}
              className="rounded-full border border-border/70 bg-bg px-3 py-1"
            >
              <Text className="text-[10px] font-mono uppercase text-muted">
                {isActive ? 'Bell' : 'Lock'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1"
            >
              <Text className="text-[10px] font-mono uppercase text-red-400">Del</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default AlertsScreen;
