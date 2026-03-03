import { create } from 'zustand';

import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { showError, showSuccess } from '../lib/toast';

type FillRecord = Database['public']['Tables']['fill_records']['Row'];
type FillRecordInsert = Database['public']['Tables']['fill_records']['Insert'];

type TrackerState = {
  records: FillRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (input: Omit<FillRecordInsert, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
};

const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated.');
  }
  return data.user.id;
};

const calcSaved = (locked: number, pump: number, litres: number) =>
  Math.max(0, Math.min(((pump - locked) / 100) * litres, 0.25 * litres));

export const useTrackerStore = create<TrackerState>((set, get) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('fill_records')
        .select('*')
        .eq('user_id', userId)
        .order('filled_at', { ascending: false });
      if (error) {
        throw error;
      }
      set({ records: data ?? [] });
    } catch (error) {
      showError('Unable to load records', error instanceof Error ? error.message : 'Try again.');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addRecord: async (input) => {
    try {
      const userId = await getUserId();
      const payload: FillRecordInsert = {
        user_id: userId,
        group_id: input.group_id ?? null,
        station_name: input.station_name,
        fuel_type: input.fuel_type,
        locked_price_cents: input.locked_price_cents,
        pump_price_cents: input.pump_price_cents,
        litres: input.litres,
        filled_at: input.filled_at,
      };
      const { data, error } = await supabase
        .from('fill_records')
        .insert(payload)
        .select()
        .single();
      if (error) {
        throw error;
      }
      const record: FillRecord = data ?? {
        ...payload,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        saved_dollars: calcSaved(
          input.locked_price_cents,
          input.pump_price_cents,
          input.litres
        ),
      };
      set({ records: [record, ...get().records] });
      showSuccess('Fill-up saved');
    } catch (error) {
      showError('Unable to save record', error instanceof Error ? error.message : 'Try again.');
      throw error;
    }
  },
}));
