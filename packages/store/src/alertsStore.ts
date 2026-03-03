import { create } from 'zustand';

import type { Database } from '../lib/database.types';
import { scheduleLocalNotification } from '../lib/notifications';
import { supabase } from '../lib/supabase';
import { showError, showInfo, showSuccess } from '../lib/toast';

type PriceAlert = Database['public']['Tables']['price_alerts']['Row'];
type PriceAlertInsert = Database['public']['Tables']['price_alerts']['Insert'];

type AlertsState = {
  alerts: PriceAlert[];
  loading: boolean;
  fetchAlerts: () => Promise<void>;
  addAlert: (input: Omit<PriceAlertInsert, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  toggleAlert: (id: string, isActive: boolean) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  checkAlerts: (stations: Station[]) => Promise<void>;
};

type Station = {
  name: string;
  fuels: Record<string, number>;
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
      showError('Unable to load alerts', error instanceof Error ? error.message : 'Try again.');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addAlert: async (input) => {
    try {
      const userId = await getUserId();
      const payload: PriceAlertInsert = {
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
      showSuccess('Alert created', 'We will notify you when it hits your target.');
    } catch (error) {
      showError('Unable to create alert', error instanceof Error ? error.message : 'Try again.');
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
      showSuccess('Alert updated', isActive ? 'Alert re-enabled.' : 'Alert paused.');
    } catch (error) {
      showError('Unable to update alert', error instanceof Error ? error.message : 'Try again.');
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
      showSuccess('Alert deleted');
    } catch (error) {
      showError('Unable to delete alert', error instanceof Error ? error.message : 'Try again.');
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
      showInfo('Price alert triggered', `${match.name} just hit your target.`);

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
