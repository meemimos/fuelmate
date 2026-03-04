import { create } from 'zustand';

import { scheduleLocalNotification, showToast, supabase } from '@fuelmate/lib';
import type { Database } from '@fuelmate/lib';

type PriceAlert = Database['public']['Tables']['price_alerts']['Row'];
type PriceAlertInsert = Database['public']['Tables']['price_alerts']['Insert'];

type FuelKey = 'unleaded' | 'premium' | 'diesel' | 'e10';

type LegacyAlertInput = Omit<PriceAlertInsert, 'id' | 'user_id' | 'created_at'>;

type QuickAlertInput = {
  fuelType: FuelKey;
  threshold: number;
  station: string;
};

type AlertsState = {
  alerts: PriceAlert[];
  loading: boolean;
  fetchAlerts: () => Promise<void>;
  addAlert: (input: LegacyAlertInput | QuickAlertInput) => Promise<void>;
  toggleAlert: (id: string, isActive: boolean) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  checkAlerts: (stations: Station[]) => Promise<void>;
};

type Station = {
  name: string;
  fuels: Record<string, number>;
};

const normalizeFuelType = (value: string): PriceAlertInsert['fuel_type'] => {
  switch (value.toLowerCase()) {
    case 'unleaded':
      return 'Unleaded';
    case 'premium':
      return 'Premium';
    case 'diesel':
      return 'Diesel';
    case 'e10':
      return 'E10';
    default:
      return value as PriceAlertInsert['fuel_type'];
  }
};

const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated.');
  }
  return data.user.id;
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  loading: false,
  fetchAlerts: async () => {
    set({ loading: true });
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      set({ alerts: data ?? [] });
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to load alerts: ${error.message}` : 'Unable to load alerts',
        'error'
      );
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addAlert: async (input) => {
    try {
      const userId = await getUserId();
      const payload: PriceAlertInsert = 'fuelType' in input
        ? {
            user_id: userId,
            fuel_type: normalizeFuelType(input.fuelType),
            threshold_cents: Number(input.threshold.toFixed(1)),
            station_name: input.station,
            is_active: true,
            last_triggered_at: null,
          }
        : {
            user_id: userId,
            fuel_type: input.fuel_type,
            threshold_cents: input.threshold_cents,
            station_name: input.station_name ?? null,
            is_active: input.is_active ?? true,
            last_triggered_at: null,
          };
      const { data, error } = await supabase
        .from('price_alerts')
        .insert(payload)
        .select()
        .single();
      if (error) {
        throw error;
      }
      set({ alerts: [data, ...get().alerts] });
      showToast('Alert created', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to create alert: ${error.message}` : 'Unable to create alert',
        'error'
      );
      throw error;
    }
  },
  toggleAlert: async (id, isActive) => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      set({
        alerts: get().alerts.map((alert) => (alert.id === id ? data : alert)),
      });
      showToast(isActive ? 'Alert re-enabled' : 'Alert paused', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to update alert: ${error.message}` : 'Unable to update alert',
        'error'
      );
      throw error;
    }
  },
  deleteAlert: async (id) => {
    try {
      const { error } = await supabase.from('price_alerts').delete().eq('id', id);
      if (error) {
        throw error;
      }
      set({ alerts: get().alerts.filter((alert) => alert.id !== id) });
      showToast('Alert deleted', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to delete alert: ${error.message}` : 'Unable to delete alert',
        'error'
      );
      throw error;
    }
  },
  checkAlerts: async (stations) => {
    // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
    const activeAlerts = get().alerts.filter((alert) => alert.is_active);
    if (activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      const eligibleStations = alert.station_name
        ? stations.filter((station) => station.name === alert.station_name)
        : stations;
      const match = eligibleStations.find(
        (station) => station.fuels[alert.fuel_type] <= alert.threshold_cents
      );
      if (!match) continue;

      // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
      await scheduleLocalNotification(
        `${alert.fuel_type} hit ${alert.threshold_cents.toFixed(1)}¢/L`,
        `${match.name} is at ${match.fuels[alert.fuel_type].toFixed(1)}¢/L`
      );
      showToast(`Price alert triggered: ${match.name} just hit your target.`, 'info');

      // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
      const timestamp = new Date().toISOString();
      await supabase
        .from('price_alerts')
        .update({ last_triggered_at: timestamp })
        .eq('id', alert.id);

      set({
        alerts: get().alerts.map((item) =>
          item.id === alert.id ? { ...item, last_triggered_at: timestamp } : item
        ),
      });
    }
  },
}));
