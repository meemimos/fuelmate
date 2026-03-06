import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Card } from '@fuelmate/ui';
import { showToast, supabase } from '@fuelmate/lib';
import { useAuthStore } from '@fuelmate/store';

export default function AcceptInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        if (!token) {
          setError('Invalid invitation link');
          setLoading(false);
          return;
        }

        if (!user?.id) {
          // User needs to sign in first
          router.replace('/login');
          return;
        }

        // Call the accept_group_invitation function
        const { data, error: rpcError } = await supabase.rpc('accept_group_invitation', {
          invitation_token: token,
          user_id: user.id,
        });

        if (rpcError) {
          throw rpcError;
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to accept invitation');
        }

        showToast('Successfully joined the group!', 'success');
        router.replace('/(tabs)/group');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [token, user?.id, router]);

  if (!user) {
    return (
      <ScrollView className="flex-1 bg-bg px-6 py-10">
        <View>
          <Text className="font-display text-3xl font-bold text-white">Join Group</Text>
          <Text className="mt-2 font-body text-sm text-muted">You need to be signed in to accept this invitation</Text>
        </View>

        <Card variant="info" className="mt-8">
          <Text className="font-body text-sm text-muted">Please sign in or create an account to join the group</Text>
        </Card>

        <Button variant="accent" size="lg" fullWidth className="mt-8" onPress={() => router.replace('/login')}>
          Sign In
        </Button>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color="#00e5a0" />
        <Text className="mt-4 font-body text-sm text-muted">Accepting invitation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView className="flex-1 bg-bg px-6 py-10">
        <View>
          <Text className="font-display text-3xl font-bold text-white">Oops!</Text>
          <Text className="mt-2 font-body text-sm text-muted">{error}</Text>
        </View>

        <Card variant="info" className="mt-8">
          <Text className="font-body text-xs text-muted">The invitation link may have expired or already been used</Text>
        </Card>

        <Button variant="accent" size="lg" fullWidth className="mt-8" onPress={() => router.replace('/(tabs)')}>
          Go Home
        </Button>
      </ScrollView>
    );
  }

  return null;
}
