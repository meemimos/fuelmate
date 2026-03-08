import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button, Card, OfflineBanner, ScreenHeader } from '@fuelmate/ui';
import { useAuthStore } from '@fuelmate/store';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <OfflineBanner />
      <View className="px-6 pt-8">
        <ScreenHeader title="Settings" badge="Account" />

        <Card className="mt-8">
          <Text className="font-mono text-[10px] uppercase tracking-widest text-muted">Signed in as</Text>
          <Text className="mt-2 font-body text-sm text-white">{user?.email ?? 'Unknown account'}</Text>
        </Card>

        <Card className="mt-4">
          <Text className="font-body text-sm text-muted">Manage your account session on this device.</Text>
          <Button
            variant="danger"
            size="md"
            fullWidth
            className="mt-4"
            accessibilityLabel="Sign out"
            onPress={handleSignOut}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </Card>
      </View>
    </ScrollView>
  );
}
