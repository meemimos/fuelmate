import { memo, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Button, Card, MoneyText, OfflineBanner, ScreenHeader, Skeleton } from '@fuelmate/ui';
import { showToast } from '@fuelmate/lib';
import { useAuthStore, useGroupStore } from '@fuelmate/store';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

type MockLock = {
  name: string;
  initial: string;
  color: string;
  fuel: string | null;
  price: number | null;
  expires: string | null;
  expiringSoon: boolean;
};

const mockActiveLocks: MockLock[] = [
  { name: 'Luv', initial: 'L', color: '#00e5a0', fuel: 'Unleaded', price: 158.9, expires: '4d 12h', expiringSoon: false },
  { name: 'Raj', initial: 'R', color: '#f59e0b', fuel: 'Unleaded', price: 162.3, expires: '1d 6h', expiringSoon: true },
  { name: 'Priya', initial: 'P', color: '#9898a8', fuel: null, price: null, expires: null, expiringSoon: false },
];

const GroupScreen = memo(function GroupScreen() {
  const router = useRouter();
  const { members, activeLocks, loading, fetchGroup, removeMember } = useGroupStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroup();
    setRefreshing(false);
  };

  const totalGroupSaved = members.reduce((s, m) => s + m.saved, 0);
  const totalLocks = members.reduce((s, m) => s + m.locks, 0);
  const leaderboard = [...members].sort((a, b) => b.saved - a.saved);
  const topSaving = leaderboard[0]?.saved ?? 1;

  const resolvedLocks: MockLock[] =
    activeLocks.length === 0
      ? mockActiveLocks
      : members.map((m) => {
          const lock = activeLocks.find((l) => l.memberId === m.id);
          if (!lock) {
            return { name: m.name, initial: m.name[0]?.toUpperCase() ?? '?', color: m.color, fuel: null, price: null, expires: null, expiringSoon: false };
          }
          const diffMs = new Date(lock.expiresAt).getTime() - Date.now();
          const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
          const days = Math.floor(totalHours / 24);
          const hours = totalHours % 24;
          return { name: m.name, initial: m.name[0]?.toUpperCase() ?? '?', color: m.color, fuel: lock.fuelType, price: lock.price, expires: `${days}d ${hours}h`, expiringSoon: totalHours <= 30 };
        });

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00e5a0" />}
    >
      <OfflineBanner />
      <View className="px-6 pt-6">
        <ScreenHeader title="Group Locks" badge={`${members.length} members`} />

        {loading ? (
          <View className="py-2">
            {[0, 1, 2].map((i) => (
              <Card key={`g-s-${i}`} className="mb-2">
                <Skeleton height={14} />
                <Skeleton height={10} className="mt-2" width="75%" />
              </Card>
            ))}
          </View>
        ) : null}

        <View className="mb-3 mt-6 flex-row gap-3">
          <Card className="flex-1">
            <Text className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted">GROUP SAVED</Text>
            <MoneyText value={Number(totalGroupSaved.toFixed(2))} size="xl" color="#00e5a0" />
          </Card>
          <Card className="flex-1">
            <Text className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted">TOTAL LOCKS</Text>
            <Text className="font-display text-[28px] font-bold tracking-tight text-white">{totalLocks}</Text>
          </Card>
        </View>

        <Card variant="info" className="mb-3">
          <Text className="mb-2 font-body text-xs font-semibold text-blue-400">Group coordination</Text>
          {[
            'Each member locks their own price in their My 7-Eleven account',
            'Share who locked what and when across the group',
            'Track collective savings and coordinate fill-up timing',
            'Each account holds one active lock — stagger to maximise savings',
          ].map((tip, i) => (
            <View key={tip} className="mb-1.5 flex-row gap-2">
              <Text className="text-blue-400">{i + 1}.</Text>
              <Text className="flex-1 font-body text-xs text-muted">{tip}</Text>
            </View>
          ))}
        </Card>

        <Card className="mb-3">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-display text-sm font-semibold text-white">Savings Leaderboard</Text>
            <Badge variant="amber">This month</Badge>
          </View>

          {leaderboard.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-4xl">👥</Text>
              <Text className="py-1 text-center font-body text-sm text-muted">Just you so far</Text>
              <Text className="text-center font-body text-sm text-muted">Invite someone to get started</Text>
            </View>
          ) : (
            leaderboard.map((m) => (
              <View key={m.id} className="flex-row items-center gap-3 border-b border-border py-3 last:border-0">
                <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${m.color}22`, borderColor: `${m.color}44`, borderWidth: 1 }}>
                  <Text className="font-display text-sm font-bold" style={{ color: m.color }}>{m.name[0]}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-body text-sm font-medium text-white">{m.name}</Text>
                    {m.userId === user?.id ? <Badge variant="gray" className="px-1.5 py-0 text-[9px]">you</Badge> : null}
                  </View>
                  <Text className="mt-0.5 font-mono text-[10px] text-muted">{m.locks} locks · {m.email ?? 'member'}</Text>
                  <View className="mt-1.5 h-1.5 overflow-hidden rounded-full border border-border bg-bg-3">
                    <View className="h-full" style={{ width: `${Math.max(4, (m.saved / topSaving) * 100)}%`, backgroundColor: m.color }} />
                  </View>
                </View>
                <View className="items-end">
                  <MoneyText value={Number(m.saved.toFixed(2))} size="md" color={m.color} />
                  {m.userId !== user?.id ? (
                    <View className="mt-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        accessibilityLabel={`Remove ${m.name}`}
                        onPress={() => {
                          Alert.alert('Remove member?', `${m.name} will lose access`, [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: async () => {
                                await removeMember(m.id);
                                showToast('Member removed', 'info');
                              },
                            },
                          ]);
                        }}
                      >
                        ✕
                      </Button>
                    </View>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </Card>

        <Card className="mb-3">
          <Text className="mb-1 font-display text-sm font-semibold text-white">Active Locks</Text>
          {resolvedLocks.map((lock, idx) => (
            <View key={`${lock.name}-${idx}`} className="flex-row items-center gap-3 border-b border-border py-3 last:border-0">
              <View className="h-9 w-9 items-center justify-center rounded-full" style={{ borderWidth: 1, borderStyle: lock.fuel ? 'solid' : 'dashed', borderColor: lock.fuel ? `${lock.color}aa` : '#3b3b48', backgroundColor: lock.fuel ? `${lock.color}22` : 'transparent' }}>
                <Text style={{ color: lock.color }} className="font-display text-sm font-bold">{lock.initial}</Text>
              </View>
              <View className="flex-1">
                {lock.fuel ? (
                  <>
                    <Text className="font-body text-sm font-medium text-white">{lock.name} · {lock.fuel}</Text>
                    <Text className="font-mono text-[10px] text-muted">{lock.price}¢/L · expires in {lock.expires}</Text>
                  </>
                ) : (
                  <>
                    <Text className="font-body text-sm text-muted">{lock.name} · No active lock</Text>
                    <Text className="font-mono text-[10px] text-muted">Current best: 158.9¢/L at Castle Hill</Text>
                  </>
                )}
              </View>
              {lock.fuel ? <Badge variant={lock.expiringSoon ? 'amber' : 'green'}>{lock.expiringSoon ? 'Expiring soon' : 'Active'}</Badge> : <Badge variant="gray">Unlocked</Badge>}
            </View>
          ))}
        </Card>

        <Button variant="primary" size="md" fullWidth accessibilityLabel="Invite group member" icon={<Text className="text-black">＋</Text>} onPress={() => router.push('/modal/invite')}>
          Invite Member
        </Button>
      </View>
    </ScrollView>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default GroupScreen;
