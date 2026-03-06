import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Card } from '@fuelmate/ui';
import { showToast, supabase } from '@fuelmate/lib';
import { useAuthStore, useGroupStore } from '@fuelmate/store';

export default function AcceptInviteScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchGroup } = useGroupStore();

  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<{
    id: string;
    group_id: string;
    group_name: string;
    invited_by_email: string;
    token: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    const loadInvitation = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('invitations')
          .select('id, group_id, token, invited_by')
          .eq('token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single();

        if (fetchError || !data) {
          setError('This invitation has expired or is invalid');
          return;
        }

        // Get group name and invited_by email
        const [{ data: groupData }, { data: profileData }] = await Promise.all([
          supabase.from('groups').select('id, name').eq('id', data.group_id).single(),
          supabase.from('profiles').select('email').eq('id', data.invited_by).single(),
        ]);

        if (groupData && profileData) {
          setInvitation({
            id: data.id,
            group_id: data.group_id,
            group_name: groupData.name,
            invited_by_email: profileData.email || 'someone',
            token,
          });
        }
      } catch (err) {
        setError('Failed to load invitation');
        console.error(err);
      }
    };

    loadInvitation();
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!invitation || !user) {
      showToast('Unable to accept invitation', 'error');
      return;
    }

    setLoading(true);
    try {
      // First, add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) {
        if (memberError.code === '23505') {
          // Already a member
          throw new Error('You are already a member of this group');
        }
        throw memberError;
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Refresh group data
      await fetchGroup();

      showToast('Invitation accepted! 🎉', 'success');
      router.replace('/(tabs)/group');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to accept invitation',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ScrollView className="flex-1 bg-bg px-6 py-8">
        <View className="flex-1 items-center justify-center">
          <Text className="mb-4 text-center font-display text-2xl font-bold text-white">
            {error}
          </Text>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.replace('/(auth)/welcome')}
          >
            Go to Home
          </Button>
        </View>
      </ScrollView>
    );
  }

  if (!invitation) {
    return (
      <ScrollView className="flex-1 bg-bg px-6 py-8">
        <View className="flex-1 items-center justify-center">
          <Text className="font-display text-lg text-white">Loading invitation...</Text>
        </View>
      </ScrollView>
    );
  }

  if (!user) {
    return (
      <ScrollView className="flex-1 bg-bg px-6 py-8">
        <View className="flex-1 items-center justify-center">
          <Text className="mb-4 text-center font-display text-xl font-bold text-white">
            Sign in to accept invitation
          </Text>
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(auth)/login')}
          >
            Sign In
          </Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg px-6 py-10" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="mb-8">
        <Text className="font-display text-3xl font-bold text-white">
          Join {invitation.group_name}?
        </Text>
        <Text className="mt-2 font-body text-sm text-muted">
          {invitation.invited_by_email} invited you to track fuel savings together
        </Text>
      </View>

      <Card variant="info" className="mb-8">
        <Text className="mb-3 font-body text-sm font-semibold text-white">What you'll get:</Text>
        <View className="gap-2">
          <Text className="font-body text-sm text-muted">• Track savings with your group</Text>
          <Text className="font-body text-sm text-muted">• See leaderboard and member stats</Text>
          <Text className="font-body text-sm text-muted">• Coordinate fuel locks together</Text>
        </View>
      </Card>

      <Button
        variant="accent"
        size="lg"
        fullWidth
        accessibilityLabel="Accept invitation"
        onPress={handleAcceptInvite}
      >
        {loading ? 'Accepting...' : '✓ Accept Invitation'}
      </Button>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        accessibilityLabel="Decline invitation"
        onPress={() => router.replace('/(tabs)/prices')}
        className="mt-3"
      >
        Decline
      </Button>
    </ScrollView>
  );
}
