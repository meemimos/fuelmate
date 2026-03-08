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
  createGroup: (name: string) => Promise<void>;
  addMember: (email: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
};

const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated.');
  }
  return data.user;
};

const getUserId = async () => (await getUser()).id;

const ensureProfile = async () => {
  const user = await getUser();
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split('@')[0] ||
    'User';

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name: displayName,
    },
    { onConflict: 'id' }
  );

  if (error) throw error;
  return user;
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
          const { data: groups } = await supabase.from('groups').select('*').eq('id', memberGroupId);
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

      const memberIds = (groupMembers ?? []).map((member: MemberRow) => member.user_id);
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', memberIds);

      const profileMap = new Map<string, ProfileRow>();
      (profiles ?? []).forEach((profile: ProfileRow) => profileMap.set(profile.id, profile));

      const mappedMembers: Member[] = (groupMembers ?? []).map((member: MemberRow, index: number) => {
        const profile = profileMap.get(member.user_id);
        return {
          id: member.id,
          userId: member.user_id,
          name: profile?.display_name ?? 'Member',
          email: profile?.email ?? undefined,
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
  createGroup: async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('Enter a group name', 'error');
      return;
    }

    try {
      const user = await ensureProfile();
      const userId = user.id;
      const { data: group, error } = await supabase
        .from('groups')
        .insert({ name: trimmedName, owner_id: userId })
        .select('*')
        .single();
      if (error) throw error;

      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: userId, role: 'owner' });
      if (memberError) throw memberError;

      const ownerMember: Member = {
        id: `owner-${userId}`,
        userId,
        name: 'You',
        locks: 0,
        saved: 0,
        color: '#00e5a0',
        isOwner: true,
      };
      set({ group: mapGroup(group), members: [ownerMember], activeLocks: [] });
      showToast('Group created', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to create group: ${error.message}` : 'Unable to create group',
        'error'
      );
      throw error;
    }
  },
  addMember: async (email: string) => {
    try {
      const group = get().group;
      if (!group) {
        throw new Error('No group selected');
      }

      const userId = await getUserId();
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          group_id: group.id,
          invited_by: userId,
          email,
          token: crypto.randomUUID?.() ?? `token-${Date.now()}`,
        })
        .select()
        .single();

      if (inviteError) {
        if (inviteError.code === '23505') {
          throw new Error(`${email} already has a pending invitation`);
        }
        throw inviteError;
      }

      const inviteLink = `${
        typeof window !== 'undefined' ? window.location.origin : 'https://fuelmate-lovat.vercel.app'
      }/accept-invite?token=${invitation.token}`;

      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteLink,
          groupName: group.name,
          invitedBy: (await supabase.auth.getUser()).data.user?.email,
        },
      });

      if (emailError) {
        console.warn('Failed to send email, but invitation was created:', emailError);
        showToast('Invite created (email may not have been sent)', 'info');
      } else {
        showToast(`Invite sent to ${email}!`, 'success');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to send invite: ${error.message}` : 'Unable to send invite',
        'error'
      );
      throw error;
    }
  },
  removeMember: async (memberId) => {
    try {
      const { error } = await supabase.from('group_members').delete().eq('id', memberId);
      if (error) throw error;

      set({ members: get().members.filter((member) => member.id !== memberId) });
      showToast('Member removed', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? `Unable to remove member: ${error.message}` : 'Unable to remove member',
        'error'
      );
      throw error;
    }
  },
}));
