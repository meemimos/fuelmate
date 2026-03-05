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
      <View className="px-6 pt-8">
        <ScreenHeader title="Price Alerts" badge={`${activeCount} active`} />

        <Card variant="info" className="mt-8">
          <Text className="mb-3 font-body text-sm font-semibold text-blue-300">How alerts work</Text>
          <Text className="font-body text-sm leading-relaxed text-muted">
            We monitor 7-Eleven fuel prices near you. When a station hits your target price, you get
            notified — open your My 7-Eleven app and lock it in yourself.
          </Text>
        </Card>

        <View className="mt-8">
          <Card>
            <View className="mb-5 flex-row items-center justify-between gap-3">
              <Text className="font-display text-lg font-semibold text-white">Your Alerts</Text>
              <Badge variant="gray">{alerts.length} total</Badge>
            </View>

            {loading ? (
              <View className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <View key={`a-s-${i}`} className="pb-3">
                    <Skeleton height={16} />
                    <Skeleton height={12} className="mt-3" width="70%" />
                  </View>
                ))}
              </View>
            ) : alerts.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-5xl">🔔</Text>
                <Text className="mt-4 text-center font-body text-base font-medium text-white">No alerts yet</Text>
                <Text className="mt-2 text-center font-body text-sm text-muted">Create your first alert below</Text>
              </View>
            ) : (
              alerts.map((alert) => (
                <View
                  key={alert.id}
                  className="flex-row items-center gap-4 border-b border-border py-4 last:border-0"
                >
                  <View
                    className={`h-10 w-10 rounded-xl border items-center justify-center flex-shrink-0 ${
                      alert.is_active ? 'border-accent/30 bg-accent/10' : 'border-amber-400/30 bg-amber-400/10'
                    }`}
                  >
                    <Text style={{ color: alert.is_active ? '#00e5a0' : '#fbbf24', fontSize: 18 }}>🔔</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="font-body text-sm font-semibold text-white">
                      {alert.fuel_type} · Under {alert.threshold_cents}¢/L
                    </Text>
                    <Text className="mt-1 font-mono text-xs text-muted">
                      {alert.station_name ?? 'Any 7-Eleven'}
                    </Text>
                    <View className="mt-2 self-start">
                      <Badge variant={alert.is_active ? 'green' : 'amber'}>
                        {alert.is_active ? 'Watching' : 'Paused'}
                      </Badge>
                    </View>
                  </View>

                  <View className="flex-row gap-2 flex-shrink-0">
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
        </View>

        <View className="mt-8">
          <Card>
            <Text className="mb-5 font-display text-lg font-semibold text-white">Recent Triggers</Text>
            {triggeredAlerts.map((t, idx) => (
              <View
                key={`${t.station}-${idx}`}
                className="flex-row items-center gap-3 border-b border-border py-4 last:border-0"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 flex-shrink-0">
                  <Text style={{ color: '#00e5a0', fontSize: 18 }}>✓</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-body text-sm font-semibold text-white">{t.station}</Text>
                  <Text className="mt-1 font-mono text-xs text-muted">
                    {t.fuel} hit {t.price}¢/L · {t.when}
                  </Text>
                </View>
                <Badge variant="green">Triggered</Badge>
              </View>
            ))}
          </Card>
        </View>

        <Button
          variant="accent"
          size="lg"
          fullWidth
          accessibilityLabel="Create new price alert"
          onPress={() => router.push('/modal/add-alert')}
          className="mt-8 mb-4"
        >
          New Price Alert
        </Button>
      </View>
    </ScrollView>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default AlertsScreen;
