import { memo, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Button, Card, MoneyText, OfflineBanner, ScreenHeader, Skeleton } from '@fuelmate/ui';
import { showToast } from '@fuelmate/lib';
import { useAuthStore, useGroupStore } from '@fuelmate/store';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

type LockRow = {
  name: string;
  initial: string;
  color: string;
  fuel: string | null;
  price: number | null;
  expires: string | null;
  expiringSoon: boolean;
};

const GroupScreen = memo(function GroupScreen() {
  const router = useRouter();
  const { members, activeLocks, loading, fetchGroup, removeMember } = useGroupStore();
  const { user, signOut } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroup();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const totalGroupSaved = members.reduce((s, m) => s + m.saved, 0);
  const totalLocks = members.reduce((s, m) => s + m.locks, 0);
  const leaderboard = [...members].sort((a, b) => b.saved - a.saved);
  const topSaving = leaderboard[0]?.saved ?? 1;

  const resolvedLocks: LockRow[] = members.map((m) => {
    const lock = activeLocks.find((l) => l.memberId === m.id);
    if (!lock) {
      return {
        name: m.name,
        initial: m.name[0]?.toUpperCase() ?? '?',
        color: m.color,
        fuel: null,
        price: null,
        expires: null,
        expiringSoon: false,
      };
    }

    const diffMs = new Date(lock.expiresAt).getTime() - Date.now();
    const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    return {
      name: m.name,
      initial: m.name[0]?.toUpperCase() ?? '?',
      color: m.color,
      fuel: lock.fuelType,
      price: lock.price,
      expires: `${days}d ${hours}h`,
      expiringSoon: totalHours <= 30,
    };
  });

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00e5a0" />}
    >
      <OfflineBanner />
      <View className="px-6 pt-8">
        <ScreenHeader title="Group Locks" badge={`${members.length} members`} />
        <View className="mt-4 items-end">
          <Button
            variant="secondary"
            size="sm"
            accessibilityLabel="Sign out"
            onPress={handleSignOut}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </View>

        {loading ? (
          <View className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <View key={`g-s-${i}`}>
                <Skeleton height={16} />
                <Skeleton height={12} className="mt-3" width="75%" />
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-8 flex-row gap-4">
          <Card className="flex-1">
            <Text className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">Group Saved</Text>
            <MoneyText value={Number(totalGroupSaved.toFixed(2))} size="xl" color="#00e5a0" />
          </Card>
          <Card className="flex-1">
            <Text className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">Total Locks</Text>
            <Text className="font-display text-3xl font-bold tracking-tight text-white">{totalLocks}</Text>
          </Card>
        </View>

        <Card variant="info" className="mt-8">
          <Text className="mb-4 font-body text-sm font-semibold text-blue-300">Group coordination</Text>
          {[
            'Each member locks their own price in their My 7-Eleven account',
            'Share who locked what and when across the group',
            'Track collective savings and coordinate fill-up timing',
            'Each account holds one active lock — stagger to maximise savings',
          ].map((tip, i) => (
            <View key={tip} className="mb-2 flex-row gap-3">
              <Text className="font-semibold text-blue-400">{i + 1}.</Text>
              <Text className="flex-1 font-body text-sm leading-relaxed text-muted">{tip}</Text>
            </View>
          ))}
        </Card>

        <View className="mt-8">
          <Card>
            <View className="mb-5 flex-row items-center justify-between gap-3">
              <Text className="font-display text-lg font-semibold text-white">Savings Leaderboard</Text>
              <Badge variant="amber">This month</Badge>
            </View>

            {leaderboard.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-5xl">👥</Text>
                <Text className="mt-4 text-center font-body text-base font-medium text-white">Just you so far</Text>
                <Text className="mt-2 text-center font-body text-sm text-muted">Invite someone to get started</Text>
              </View>
            ) : (
              leaderboard.map((m) => (
                <View key={m.id} className="flex-row items-center gap-4 border-b border-border py-4 last:border-0">
                  <View
                    className="h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${m.color}22`, borderColor: `${m.color}44`, borderWidth: 1.5 }}
                  >
                    <Text className="font-display text-base font-bold" style={{ color: m.color }}>
                      {m.name[0]}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-body text-sm font-semibold text-white">{m.name}</Text>
                      {m.userId === user?.id ? <Badge variant="gray" className="px-2 py-0.5 text-[9px]">you</Badge> : null}
                    </View>
                    <Text className="mt-1 font-mono text-xs text-muted">{m.locks} locks · {m.email ?? 'member'}</Text>
                    <View className="mt-2 h-2 overflow-hidden rounded-full border border-border bg-bg-3">
                      <View
                        className="h-full"
                        style={{ width: `${Math.max(4, (m.saved / topSaving) * 100)}%`, backgroundColor: m.color }}
                      />
                    </View>
                  </View>
                  <View className="flex-shrink-0 items-end">
                    <MoneyText value={Number(m.saved.toFixed(2))} size="md" color={m.color} />
                    {m.userId !== user?.id ? (
                      <View className="mt-2">
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
        </View>

        <View className="mt-8">
          <Card>
            <Text className="mb-5 font-display text-lg font-semibold text-white">Active Locks</Text>
            {resolvedLocks.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-center font-body text-sm text-muted">No active lock data yet</Text>
              </View>
            ) : (
              resolvedLocks.map((lock, idx) => (
                <View key={`${lock.name}-${idx}`} className="flex-row items-center gap-4 border-b border-border py-4 last:border-0">
                  <View
                    className="h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      borderWidth: 1.5,
                      borderStyle: lock.fuel ? 'solid' : 'dashed',
                      borderColor: lock.fuel ? `${lock.color}aa` : '#3b3b48',
                      backgroundColor: lock.fuel ? `${lock.color}22` : 'transparent',
                    }}
                  >
                    <Text style={{ color: lock.color }} className="font-display text-base font-bold">
                      {lock.initial}
                    </Text>
                  </View>
                  <View className="flex-1">
                    {lock.fuel ? (
                      <>
                        <Text className="font-body text-sm font-semibold text-white">{lock.name} · {lock.fuel}</Text>
                        <Text className="mt-1 font-mono text-xs text-muted">{lock.price}¢/L · expires in {lock.expires}</Text>
                      </>
                    ) : (
                      <Text className="font-body text-sm text-muted">{lock.name} · No active lock</Text>
                    )}
                  </View>
                  {lock.fuel ? (
                    <Badge variant={lock.expiringSoon ? 'amber' : 'green'}>{lock.expiringSoon ? 'Expiring soon' : 'Active'}</Badge>
                  ) : (
                    <Badge variant="gray">Unlocked</Badge>
                  )}
                </View>
              ))
            )}
          </Card>
        </View>

        <Button
          variant="accent"
          size="lg"
          fullWidth
          accessibilityLabel="Invite group member"
          onPress={() => router.push('/modal/invite')}
          className="mt-8"
        >
          ＋ Invite Member
        </Button>
      </View>
    </ScrollView>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default GroupScreen;
