import { create } from 'zustand';

import { showToast, supabase } from '@fuelmate/lib';
import type { Database } from '@fuelmate/lib';

type GroupRow = Database['public']['Tables']['groups']['Row'];
type MemberRow = Database['public']['Tables']['group_members']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type Group = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string | null;
};

export type Member = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  locks: number;
  saved: number;
  color: string;
  isOwner: boolean;
};

export type ActiveLock = {
  id: string;
  memberId: string;
  fuelType: string;
  price: number;
  expiresAt: string;
};

type GroupState = {
  group: Group | null;
  members: Member[];
  activeLocks: ActiveLock[];
  loading: boolean;
  fetchGroup: () => Promise<void>;
  addMember: (email: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
};

const MOCK_GROUP: Group = {
  id: 'group-1',
  name: 'The Smith Family',
  ownerId: 'dev-user-123',
  createdAt: new Date().toISOString(),
};

const MOCK_MEMBERS: Member[] = [
  {
    id: 'member-1',
    userId: 'dev-user-123',
    name: 'You',
    email: 'you@fuelmate.dev',
    locks: 6,
    saved: 128.4,
    color: '#00e5a0',
    isOwner: true,
  },
  {
    id: 'member-2',
    userId: 'user-2',
    name: 'Maya',
    email: 'maya@email.com',
    locks: 4,
    saved: 92.2,
    color: '#ffb020',
    isOwner: false,
  },
  {
    id: 'member-3',
    userId: 'user-3',
    name: 'Jude',
    email: 'jude@email.com',
    locks: 3,
    saved: 64.5,
    color: '#6aa9ff',
    isOwner: false,
  },
  {
    id: 'member-4',
    userId: 'user-4',
    name: 'Priya',
    email: 'priya@email.com',
    locks: 1,
    saved: 21.7,
    color: '#ff6b00',
    isOwner: false,
  },
];

const MOCK_LOCKS: ActiveLock[] = [
  {
    id: 'lock-1',
    memberId: 'member-1',
    fuelType: 'Unleaded',
    price: 158.9,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lock-2',
    memberId: 'member-2',
    fuelType: 'Diesel',
    price: 171.2,
    expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
  },
];

const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated.');
  }
  return data.user.id;
};

const mapGroup = (group: GroupRow): Group => ({
  id: group.id,
  name: group.name,
  ownerId: group.owner_id,
  createdAt: group.created_at,
});

export const useGroupStore = create<GroupState>((set, get) => ({
  group: null,
  members: [],
  activeLocks: [],
  loading: false,
  fetchGroup: async () => {
    set({ loading: true });
    if (__DEV__) {
      set({ group: MOCK_GROUP, members: MOCK_MEMBERS, activeLocks: MOCK_LOCKS });
      set({ loading: false });
      return;
    }
    try {
      const userId = await getUserId();
      const { data: ownedGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('owner_id', userId)
        .limit(1);

      let group = ownedGroups?.[0] ?? null;
      if (!group) {
        const { data: memberships } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', userId)
          .limit(1);
        const memberGroupId = memberships?.[0]?.group_id;
        if (memberGroupId) {
          const { data: groups } = await supabase
            .from('groups')
            .select('*')
            .eq('id', memberGroupId);
          group = groups?.[0] ?? null;
        }
      }

      if (!group) {
        set({ group: null, members: [], activeLocks: [] });
        return;
      }

      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id);

      const memberIds = (groupMembers ?? []).map((member) => member.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', memberIds);

      const profileMap = new Map<string, ProfileRow>();
      profiles?.forEach((profile) => profileMap.set(profile.id, profile));

      const mappedMembers: Member[] = (groupMembers ?? []).map((member: MemberRow, index) => {
        const profile = profileMap.get(member.user_id);
        return {
          id: member.id,
          userId: member.user_id,
          name: profile?.display_name ?? 'Member',
          locks: 0,
          saved: 0,
          color: ['#00e5a0', '#ff6b00', '#6aa9ff', '#ffb020'][index % 4],
          isOwner: member.role === 'owner',
        };
      });

      set({ group: mapGroup(group), members: mappedMembers, activeLocks: [] });
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to load group: ${error.message}` : 'Unable to load group',
        'error'
      );
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addMember: async (email: string) => {
    if (__DEV__) {
      const nextMember: Member = {
        id: `member-${Date.now()}`,
        userId: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        locks: 0,
        saved: 0,
        color: '#6aa9ff',
        isOwner: false,
      };
      set({ members: [...get().members, nextMember] });
      showToast('Invite sent', 'success');
      return;
    }
    showToast('Invite queued', 'info');
    void email;
  },
  removeMember: async (memberId) => {
    if (__DEV__) {
      set({ members: get().members.filter((member) => member.id !== memberId) });
      showToast('Member removed', 'success');
      return;
    }
    try {
      const { error } = await supabase.from('group_members').delete().eq('id', memberId);
      if (error) {
        throw error;
      }
      set({ members: get().members.filter((member) => member.id !== memberId) });
      showToast('Member removed', 'success');
    } catch (error) {
      showToast(
        error instanceof Error
          ? `Unable to remove member: ${error.message}`
          : 'Unable to remove member',
        'error'
      );
      throw error;
    }
  },
}));
