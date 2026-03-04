import { create } from 'zustand';

import { showToast, supabase } from '@fuelmate/lib';
import type { Database } from '@fuelmate/lib';

type FillRecord = Database['public']['Tables']['fill_records']['Row'];
type FillRecordInsert = Database['public']['Tables']['fill_records']['Insert'];

type TrackerState = {
  records: FillRecord[];
  loading: boolean;
  totalSaved: number;
  monthTotal: number;
  avgPerFill: number;
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

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const computeStats = (records: FillRecord[]) => {
  const totalSaved = records.reduce((sum, record) => sum + (record.saved_dollars ?? 0), 0);
  const currentKey = getMonthKey(new Date());
  const monthTotal = records.reduce((sum, record) => {
    const recordKey = getMonthKey(new Date(record.filled_at));
    return recordKey === currentKey ? sum + (record.saved_dollars ?? 0) : sum;
  }, 0);
  const avgPerFill = records.length ? totalSaved / records.length : 0;

  return { totalSaved, monthTotal, avgPerFill };
};

export const useTrackerStore = create<TrackerState>((set, get) => ({
  records: [],
  loading: false,
  totalSaved: 0,
  monthTotal: 0,
  avgPerFill: 0,
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
      const nextRecords = data ?? [];
      set({ records: nextRecords, ...computeStats(nextRecords) });
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to load records: ${error.message}` : 'Unable to load records',
        'error'
      );
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
      const nextRecords = [record, ...get().records];
      set({ records: nextRecords, ...computeStats(nextRecords) });
      showToast('Fill-up saved', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to save record: ${error.message}` : 'Unable to save record',
        'error'
      );
      throw error;
    }
  },
}));
