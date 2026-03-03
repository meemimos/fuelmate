import { memo, useCallback, useEffect, useMemo } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Button, Card, MoneyText, ScreenHeader } from '@fuelmate/ui';
import { useGroupStore } from '@fuelmate/store';
import { MOCK_STATIONS } from '@/data/mockStations';
import { SkeletonBlock } from '@/components/Skeleton';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

const formatPrice = (value: number) => `${value.toFixed(1)}¢/L`;

const MEMBER_ROW_HEIGHT = 132;
const LOCK_ROW_HEIGHT = 112;

const getBestPriceHint = () => {
  const best = Math.min(...MOCK_STATIONS.map((station) => station.fuels.Unleaded));
  return `Best nearby: ${best.toFixed(1)}¢/L`;
};

const getTimeRemaining = (expiresAt: string) => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) {
    return { label: 'Expired', daysLeft: -1 };
  }
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { label: `${days}d ${hours}h`, daysLeft: days };
};

const GroupScreen = memo(function GroupScreen() {
  const router = useRouter();
  const group = useGroupStore((state) => state.group);
  const members = useGroupStore((state) => state.members);
  const activeLocks = useGroupStore((state) => state.activeLocks);
  const loading = useGroupStore((state) => state.loading);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const removeMember = useGroupStore((state) => state.removeMember);

  useEffect(() => {
    fetchGroup().catch((error) =>
      Alert.alert('Unable to load group', error instanceof Error ? error.message : 'Try again.')
    );
  }, [fetchGroup]);

  const totalGroupSaved = useMemo(
    () => members.reduce((sum, member) => sum + member.saved, 0),
    [members]
  );
  const totalLocks = useMemo(
    () => members.reduce((sum, member) => sum + member.locks, 0),
    [members]
  );
  const topSaved = Math.max(1, ...members.map((member) => member.saved));
  const count = members.length;

  const lockMap = new Map(activeLocks.map((lock) => [lock.memberId, lock]));
  const bestHint = getBestPriceHint();

  const handleInvite = useCallback(() => {
    router.push('/modal/invite');
  }, [router]);

  const handleRemove = useCallback(
    (memberId: string, memberName: string) => {
      Alert.alert('Remove member', `Remove ${memberName} from the group?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMember(memberId),
        },
      ]);
    },
    [removeMember]
  );

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 pt-6">
          <ScreenHeader title="Group Locks" badge="..." />
          <View className="mt-6 flex-row gap-3">
            <Card className="flex-1">
              <SkeletonBlock height={12} width={120} />
              <SkeletonBlock height={38} className="mt-3" />
            </Card>
            <Card className="flex-1">
              <SkeletonBlock height={12} width={120} />
              <SkeletonBlock height={38} className="mt-3" />
            </Card>
          </View>
          <Card variant="info" className="mt-6">
            <SkeletonBlock height={12} />
            <SkeletonBlock height={12} className="mt-2" />
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 pt-6">
        <ScreenHeader title="Group Locks" badge={`${count} members`} />

        <View className="mt-6 flex-row gap-3">
          <Card className="flex-1">
            <Text className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted">
              Group saved
            </Text>
            <MoneyText value={totalGroupSaved} size="xl" />
          </Card>
          <Card className="flex-1">
            <Text className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted">
              Total locks
            </Text>
            <Text className="mt-2 text-[30px] font-display font-semibold text-white">
              {totalLocks}
            </Text>
          </Card>
        </View>

        <Card variant="info" className="mt-6">
          <Text className="text-sm text-white">
            1. Stagger locks across accounts to cover more days.
          </Text>
          <Text className="mt-2 text-sm text-white">
            2. Track who locked which price and expiry.
          </Text>
          <Text className="mt-2 text-sm text-white">
            3. Share the best station when prices drop.
          </Text>
          <Text className="mt-2 text-sm text-white">
            4. Use alerts to avoid missing overnight dips.
          </Text>
        </Card>

        <Card className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base text-white">Savings Leaderboard</Text>
            <Badge variant="amber">This month</Badge>
          </View>
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <MemberRow member={item} topSaved={topSaved} onRemove={handleRemove} />
            )}
            getItemLayout={(_, index) => ({
              length: MEMBER_ROW_HEIGHT,
              offset: MEMBER_ROW_HEIGHT * index,
              index,
            })}
            ItemSeparatorComponent={() => <View className="h-4" />}
            className="mt-4"
          />
        </Card>

        <Card className="mt-6">
          <Text className="font-display text-base text-white">Active Locks</Text>
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <LockRow member={item} lock={lockMap.get(item.id)} bestHint={bestHint} />
            )}
            getItemLayout={(_, index) => ({
              length: LOCK_ROW_HEIGHT,
              offset: LOCK_ROW_HEIGHT * index,
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
          onPress={handleInvite}
        >
          Invite Member
        </Button>
      </View>
    </ScrollView>
  );
});

type MemberRowProps = {
  member: {
    id: string;
    name: string;
    email?: string;
    locks: number;
    saved: number;
    color: string;
    isOwner: boolean;
  };
  topSaved: number;
  onRemove: (memberId: string, memberName: string) => void;
};

const MemberRow = memo(function MemberRow({ member, topSaved, onRemove }: MemberRowProps) {
  const progress = Math.max(0.15, member.saved / topSaved);
  const handleRemove = useCallback(() => onRemove(member.id, member.name), [member, onRemove]);

  return (
    <View className="rounded-xl border border-border/60 bg-bg-3 px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${member.color}33` }}
          >
            <Text className="text-sm font-semibold text-white">
              {member.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-medium text-white">{member.name}</Text>
              {member.isOwner ? <Badge variant="gray">you</Badge> : null}
            </View>
            <Text className="mt-1 text-[11px] text-muted">
              {member.locks} locks · {member.email ?? 'Member'}
            </Text>
          </View>
        </View>
        <MoneyText value={member.saved} size="md" color={member.color} />
      </View>
      <View className="mt-3 h-1.5 w-full rounded-full bg-border/60">
        <View
          className="h-1.5 rounded-full"
          style={{ width: `${progress * 100}%`, backgroundColor: member.color }}
        />
      </View>
      {!member.isOwner ? (
        <View className="mt-3 flex-row justify-end">
          <Pressable
            onPress={handleRemove}
            className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1"
          >
            <Text className="text-[10px] font-mono uppercase text-red-400">Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});

type LockRowProps = {
  member: {
    id: string;
    name: string;
    color: string;
  };
  lock?: {
    fuelType: string;
    price: number;
    expiresAt: string;
  };
  bestHint: string;
};

const LockRow = memo(function LockRow({ member, lock, bestHint }: LockRowProps) {
  if (lock) {
    const timeRemaining = getTimeRemaining(lock.expiresAt);
    const isExpiring = timeRemaining.daysLeft >= 0 && timeRemaining.daysLeft < 2;
    return (
      <View className="rounded-xl border border-border/60 bg-bg-3 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${member.color}33` }}
            >
              <Text className="text-sm font-semibold text-white">
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-white">{member.name}</Text>
              <Text className="mt-1 text-[11px] text-muted">
                {lock.fuelType} · {formatPrice(lock.price)} · expires in {timeRemaining.label}
              </Text>
            </View>
          </View>
          <Badge variant={isExpiring ? 'amber' : 'green'}>
            {isExpiring ? 'Expiring soon' : 'Active'}
          </Badge>
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-xl border border-dashed border-border/60 bg-bg-3 px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full border border-border/60">
            <Text className="text-xs text-muted">--</Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-white">{member.name}</Text>
            <Text className="mt-1 text-[11px] text-muted">No active lock</Text>
          </View>
        </View>
        <Text className="text-[11px] text-muted">{bestHint}</Text>
      </View>
    </View>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default GroupScreen;
