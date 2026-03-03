import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Card, LedDisplay, MoneyText, ScreenHeader } from '@fuelmate/ui';
import type { FuelType, Station } from '@/data/mockStations';
import { MOCK_STATIONS } from '@/data/mockStations';
import { SkeletonBlock } from '@/components/Skeleton';
import { TabErrorBoundary } from '@/components/TabErrorBoundary';

const FUEL_TYPES: FuelType[] = ['Unleaded', 'Premium', 'Diesel', 'E10'];
const STATION_ROW_HEIGHT = 128;

const formatPrice = (value: number) => value.toFixed(1);

const getMinMax = (stations: Station[], fuelType: FuelType) => {
  const values = stations.map((station) => station.fuels[fuelType]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
};

const calcSaveFor50L = (high: number, low: number) =>
  Math.max(0, ((high - low) / 100) * 50);

const PricesScreen = memo(function PricesScreen() {
  const router = useRouter();
  const [fuelType, setFuelType] = useState<FuelType>('Unleaded');
  const [loading, setLoading] = useState(true);

  const { min, max } = useMemo(() => getMinMax(MOCK_STATIONS, fuelType), [fuelType]);

  const sortedStations = useMemo(() => {
    return [...MOCK_STATIONS].sort(
      (a, b) => a.fuels[fuelType] - b.fuels[fuelType]
    );
  }, [fuelType]);

  const bestStation = sortedStations[0];
  const highestStation = sortedStations[sortedStations.length - 1];
  const save50L = calcSaveFor50L(max, min);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFuelSelect = useCallback((type: FuelType) => {
    setFuelType(type);
  }, []);

  const handleStationPress = useCallback(
    (stationId: string) => {
      router.push({
        pathname: '/modal/station',
        params: { stationId, fuelType },
      });
    },
    [fuelType, router]
  );

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-6">
          <ScreenHeader title="Price Finder" badge="..." />
          <Card variant="fuel" className="mt-6">
            <SkeletonBlock height={12} width={160} />
            <SkeletonBlock height={64} className="mt-4" />
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 28 }}>
      <View className="px-6 pt-6">
        <ScreenHeader title="Price Finder" badge="Live · Sydney" />

        <Card variant="fuel" className="mt-6">
          <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-fuel">
            Best local price
          </Text>
          <View className="mt-4 flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <View className="flex-row items-end gap-2">
                <LedDisplay value={formatPrice(min)} height={72} color="#ff6b00" />
                <Text className="mb-2 font-mono text-xs text-muted">¢/L</Text>
              </View>
              <Text className="mt-2 text-xs text-muted">{bestStation?.name}</Text>
            </View>
            <View className="items-end">
              <Text className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted">
                Highest nearby
              </Text>
              <LedDisplay value={formatPrice(max)} height={36} color="#1a5a3a" />
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-muted">Save up to</Text>
              <MoneyText value={save50L} size="lg" />
            </View>
            <Badge variant="green">✓ Lock this now</Badge>
          </View>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-6"
          contentContainerStyle={{ gap: 10 }}
        >
          {FUEL_TYPES.map((type) => {
            const isActive = type === fuelType;
            return (
              <Pressable
                key={type}
                onPress={() => handleFuelSelect(type)}
                className={`rounded-full border px-4 py-2 ${
                  isActive ? 'border-accent bg-accent/10' : 'border-border bg-bg-3'
                }`}
              >
                <Text
                  className={`font-mono text-[11px] uppercase tracking-[1.2px] ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Card className="mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base text-white">Nearby Stations</Text>
            <Badge variant="gray">{`${sortedStations.length} stations`}</Badge>
          </View>
          <FlatList
            data={sortedStations}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <StationRow
                station={item}
                rank={index + 1}
                fuelType={fuelType}
                minPrice={min}
                maxPrice={max}
                onPress={handleStationPress}
              />
            )}
            getItemLayout={(_, index) => ({
              length: STATION_ROW_HEIGHT,
              offset: STATION_ROW_HEIGHT * index,
              index,
            })}
            ItemSeparatorComponent={() => <View className="h-4" />}
            className="mt-4"
          />
        </Card>

        <Text className="mt-5 text-center text-xs text-muted">
          Tap a station for details &amp; lock tip
        </Text>
      </View>
    </ScrollView>
  );
});

type StationRowProps = {
  station: Station;
  rank: number;
  fuelType: FuelType;
  minPrice: number;
  maxPrice: number;
  onPress: (stationId: string) => void;
};

const StationRow = memo(function StationRow({
  station,
  rank,
  fuelType,
  minPrice,
  maxPrice,
  onPress,
}: StationRowProps) {
  const price = station.fuels[fuelType];
  const isBest = price === minPrice;
  const range = Math.max(1, maxPrice - minPrice);
  const progress = 1 - (price - minPrice) / range;
  const progressWidth = `${Math.max(12, progress * 100)}%`;
  const handlePress = useCallback(() => onPress(station.id), [onPress, station.id]);

  return (
    <Pressable
      onPress={handlePress}
      className="min-h-[112px] rounded-xl border border-border/60 bg-bg-3 px-4 py-4"
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={`font-mono text-xs ${
                rank === 1 ? 'text-accent' : 'text-muted'
              }`}
            >
              #{rank}
            </Text>
            <Text className="text-[13px] font-medium text-white">{station.name}</Text>
            {isBest ? <Badge variant="green">Best</Badge> : null}
          </View>
          <Text className="mt-1 text-[10px] text-muted">{station.address}</Text>
          <View className="mt-3 h-1.5 w-full rounded-full bg-border/60">
            <View className="h-1.5 rounded-full bg-accent" style={{ width: progressWidth }} />
          </View>
          <Text className="mt-2 text-[10px] text-muted">{station.distanceKm} km away</Text>
        </View>
        <LedDisplay value={formatPrice(price)} height={28} color={isBest ? '#ff6b00' : '#1a5a3a'} />
      </View>
    </Pressable>
  );
});

export { TabErrorBoundary as ErrorBoundary };
export default PricesScreen;
