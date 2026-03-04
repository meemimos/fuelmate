import { memo, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Button, Card, OfflineBanner, ScreenHeader, Skeleton } from '@fuelmate/ui';
import { showToast } from '@fuelmate/lib';
import { useAlertsStore } from '@fuelmate/store';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

const AlertsScreen = memo(function AlertsScreen() {
  const router = useRouter();
  const { alerts, loading, toggleAlert, deleteAlert, fetchAlerts } = useAlertsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [triggeredAlerts] = useState([
    { station: '7-Eleven Castle Hill', price: 158.9, fuel: 'Unleaded', when: '2h ago' },
    { station: '7-Eleven Blacktown', price: 157.3, fuel: 'Unleaded', when: 'Yesterday' },
  ]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const activeCount = alerts.filter((a) => a.is_active).length;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00e5a0" />}
    >
      <OfflineBanner />
      <View className="px-6 pt-6">
        <ScreenHeader title="Price Alerts" badge={`${activeCount} active`} />

        <Card variant="info" className="mb-3 mt-6">
          <Text className="mb-2 font-body text-xs font-semibold text-blue-400">How alerts work</Text>
          <Text className="font-body text-xs leading-relaxed text-muted">
            We monitor 7-Eleven fuel prices near you. When a station hits your target price, you get
            notified — open your My 7-Eleven app and lock it in yourself.
          </Text>
        </Card>

        <Card className="mb-3">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-display text-sm font-semibold text-white">Your Alerts</Text>
            <Badge variant="gray">{alerts.length} total</Badge>
          </View>

          {loading ? (
            <View className="py-2">
              {[0, 1, 2].map((i) => (
                <Card key={`a-s-${i}`} className="mb-2">
                  <Skeleton height={14} />
                  <Skeleton height={10} className="mt-2" width="70%" />
                </Card>
              ))}
            </View>
          ) : alerts.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-4xl">🔔</Text>
              <Text className="py-1 text-center font-body text-sm text-muted">No alerts yet</Text>
              <Text className="text-center font-body text-sm text-muted">Create your first alert below</Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <View
                key={alert.id}
                className="flex-row items-center gap-3 border-b border-border py-3.5 last:border-0"
              >
                <View
                  className={`h-9 w-9 rounded-xl border items-center justify-center ${
                    alert.is_active ? 'border-accent/20 bg-accent/10' : 'border-amber-400/20 bg-amber-400/10'
                  }`}
                >
                  <Text style={{ color: alert.is_active ? '#00e5a0' : '#f59e0b' }}>🔔</Text>
                </View>

                <View className="flex-1">
                  <Text className="font-body text-sm font-medium text-white">
                    {alert.fuel_type} · Under {alert.threshold_cents}¢/L
                  </Text>
                  <Text className="mt-0.5 font-mono text-[10px] text-muted">
                    {alert.station_name ?? 'Any 7-Eleven'}
                  </Text>
                  <View className="mt-1 self-start">
                    <Badge variant={alert.is_active ? 'green' : 'amber'}>
                      {alert.is_active ? 'Watching' : 'Paused'}
                    </Badge>
                  </View>
                </View>

                <View className="flex-row gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    accessibilityLabel={alert.is_active ? 'Pause alert' : 'Resume alert'}
                    onPress={() => toggleAlert(alert.id, !alert.is_active)}
                  >
                    {alert.is_active ? '🔒' : '🔔'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    accessibilityLabel="Delete alert"
                    onPress={() => {
                      Alert.alert('Remove alert?', 'This cannot be undone', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: async () => {
                            await deleteAlert(alert.id);
                            showToast('Alert removed', 'info');
                          },
                        },
                      ]);
                    }}
                  >
                    🗑️
                  </Button>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card className="mb-3">
          <Text className="mb-1 font-display text-sm font-semibold text-white">Recent Triggers</Text>
          {triggeredAlerts.map((t, idx) => (
            <View
              key={`${t.station}-${idx}`}
              className="flex-row items-center gap-3 border-b border-border py-3.5 last:border-0"
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                <Text className="text-accent">✓</Text>
              </View>
              <View className="flex-1">
                <Text className="font-body text-sm font-medium text-white">{t.station}</Text>
                <Text className="font-mono text-[10px] text-muted">
                  {t.fuel} hit {t.price}¢/L · {t.when}
                </Text>
              </View>
              <Badge variant="green">Triggered</Badge>
            </View>
          ))}
        </Card>

        <Button
          variant="primary"
          size="md"
          fullWidth
          accessibilityLabel="Create new price alert"
          onPress={() => router.push('/modal/add-alert')}
        >
          New Price Alert
        </Button>
      </View>
    </ScrollView>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default AlertsScreen;
