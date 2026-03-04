import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Badge, Card, LedDisplay, MoneyText, OfflineBanner, ScreenHeader, Skeleton } from '@fuelmate/ui';
import { MOCK_STATIONS } from '@fuelmate/lib/mockData';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

type FuelKey = 'unleaded' | 'premium' | 'diesel' | 'e10';

type PriceStation = {
  id: string;
  name: string;
  address: string;
  distance: number;
  distanceKm?: number;
  unleaded: number;
  premium: number;
  diesel: number;
  e10: number;
};

const FUEL_OPTIONS: Array<{ key: FuelKey; label: 'Unleaded' | 'Premium' | 'Diesel' | 'E10' }> = [
  { key: 'unleaded', label: 'Unleaded' },
  { key: 'premium', label: 'Premium' },
  { key: 'diesel', label: 'Diesel' },
  { key: 'e10', label: 'E10' },
];

const STATION_ROW_HEIGHT = 128;
const formatPrice = (value: number) => value.toFixed(1);

const PricesScreen = memo(function PricesScreen() {
  const router = useRouter();
  const [fuelType, setFuelType] = useState<FuelKey>('unleaded');
  const [refreshing, setRefreshing] = useState(false);
  const loading = false;

  const stations = useMemo<PriceStation[]>(
    () =>
      MOCK_STATIONS.map((station) => ({
        id: station.id,
        name: station.name,
        address: station.address,
        distance: station.distanceKm,
        unleaded: station.fuels.Unleaded,
        premium: station.fuels.Premium,
        diesel: station.fuels.Diesel,
        e10: station.fuels.E10,
      })),
    []
  );

  const sorted = useMemo(() => [...stations].sort((a, b) => a[fuelType] - b[fuelType]), [fuelType, stations]);
  const minPrice = sorted[0]?.[fuelType] ?? 0;
  const maxPrice = sorted[sorted.length - 1]?.[fuelType] ?? 0;
  const savingsOn50L = Number((((maxPrice - minPrice) / 100) * 50).toFixed(2));

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleFuelSelect = useCallback(async (type: FuelKey) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFuelType(type);
  }, []);

  const handleStationPress = useCallback(
    async (station: PriceStation) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({ pathname: '/modal/station', params: { station: JSON.stringify(station), fuelType } });
    },
    [fuelType, router]
  );

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: 28 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00e5a0" />}
    >
      <OfflineBanner />
      <View className="px-6 pt-6">
        <ScreenHeader title="Price Finder" badge="Live · Sydney" />

        {loading ? (
          <View className="py-2">
            {[0, 1, 2].map((i) => (
              <Card key={`p-s-${i}`} className="mb-2">
                <Skeleton height={14} />
                <Skeleton height={10} className="mt-2" width="70%" />
              </Card>
            ))}
          </View>
        ) : null}

        <Card variant="fuel" className="mb-3">
          <Text className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">BEST LOCAL PRICE</Text>
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <View className="flex-row items-end">
                <LedDisplay value={formatPrice(minPrice)} height={72} color="#ff6b00" />
                <Text className="ml-1 mb-2 self-end font-mono text-xs text-muted-foreground">¢/L</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="font-mono text-[9px] text-muted-foreground">highest nearby</Text>
              <LedDisplay value={formatPrice(maxPrice)} height={36} color="#1a5a3a" dimColor="rgba(0,60,30,0.12)" />
              <Text className="mt-2 font-mono text-[9px] text-muted-foreground">save up to</Text>
              <MoneyText value={savingsOn50L} size="lg" color="#00e5a0" />
              <Text className="font-mono text-[9px] text-muted-foreground">on 50L fill</Text>
            </View>
          </View>
          <View className="mt-4 flex-row items-center">
            <Badge variant="green">Lock this now</Badge>
            <Text className="ml-2 text-[10px] text-muted-foreground">{sorted[0]?.name ?? '—'}</Text>
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {FUEL_OPTIONS.map((option) => {
            const isActive = option.key === fuelType;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityLabel={`Select ${option.label}`}
                onPress={() => handleFuelSelect(option.key)}
                className={`mr-2 rounded-full px-4 py-1.5 ${isActive ? 'border border-accent bg-accent/10' : 'border border-border bg-bg-3'}`}
              >
                <Text className={`text-xs ${isActive ? 'font-body font-medium text-accent' : 'font-body text-muted-foreground'}`}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Card className="mb-3 mt-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-sm font-semibold">Nearby Stations</Text>
            <Badge variant="gray">{`${sorted.length} found`}</Badge>
          </View>
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <StationRow station={item} rank={index + 1} index={index} fuelType={fuelType} minPrice={minPrice} maxPrice={maxPrice} onPress={handleStationPress} />
            )}
            getItemLayout={(_, index) => ({ length: STATION_ROW_HEIGHT, offset: STATION_ROW_HEIGHT * index, index })}
            ItemSeparatorComponent={() => <View className="h-px bg-border" />}
            className="mt-3"
          />
        </Card>

        <Text className="py-2 text-center font-mono text-[10px] text-muted-foreground">Tap a station for details &amp; lock tip</Text>
      </View>
    </ScrollView>
  );
});

type StationRowProps = {
  station: PriceStation;
  rank: number;
  index: number;
  fuelType: FuelKey;
  minPrice: number;
  maxPrice: number;
  onPress: (station: PriceStation) => void;
};

const StationRow = memo(function StationRow({ station, rank, index, fuelType, minPrice, maxPrice, onPress }: StationRowProps) {
  const price = station[fuelType];
  const range = Math.max(1, maxPrice - minPrice);
  const progress = ((maxPrice - price) / range) * 100;
  const progressWidth = `${Math.max(0, Math.min(100, progress))}%`;
  const handlePress = useCallback(() => onPress(station), [onPress, station]);

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel={`View ${station.name} station`} className="py-4">
      <View className="flex-row items-start gap-3">
        <Text className={`w-6 font-mono text-sm ${rank === 1 ? 'text-accent' : 'text-muted-foreground'}`}>{rank}</Text>
        <View className="flex-1">
          <Text className="font-body text-sm font-medium text-white" numberOfLines={1}>{station.name}</Text>
          <Text className="font-mono text-[10px] text-muted-foreground" numberOfLines={1}>{station.address}</Text>
          <View className="mt-1.5 h-1.5 overflow-hidden rounded-full border border-border bg-bg-3">
            <View className="h-full rounded-full bg-accent" style={{ width: progressWidth as `${number}%` }} />
          </View>
          <Text className="mt-1 font-mono text-[10px] text-muted-foreground">{station.distance} km away</Text>
        </View>
        <View className="items-end gap-1">
          <LedDisplay value={formatPrice(price)} height={28} color={index === 0 ? '#ff6b00' : '#1a5a3a'} dimColor={index === 0 ? 'rgba(255,107,0,0.07)' : 'rgba(0,60,30,0.12)'} />
          <Text className="font-mono text-[9px] text-muted-foreground">¢/L</Text>
          {index === 0 ? <Badge variant="green" className="text-[9px]">Best</Badge> : null}
        </View>
      </View>
    </Pressable>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default PricesScreen;
