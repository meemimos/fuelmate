import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input } from '@fuelmate/ui';
import { useGroupStore } from '@fuelmate/store';

export default function InviteModal() {
  const router = useRouter();
  const addMember = useGroupStore((state) => state.addMember);
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Enter an email', 'We need an email to send the invite.');
      return;
    }
    try {
      await addMember(email.trim());
      Alert.alert('Invite sent', 'We will email the invite link shortly.');
      router.back();
    } catch (error) {
      Alert.alert('Unable to send invite', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 py-8">
      <Text className="font-display text-2xl text-white">Invite Member</Text>
      <Text className="mt-2 font-body text-base text-muted">
        Invite teammates to share fuel data and alerts.
      </Text>

      <View className="mt-6 gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="member@email.com"
          type="email"
        />
        <Card variant="info">
          <Text className="text-sm text-white">
            Each person uses their own My 7-Eleven account to lock prices.
          </Text>
        </Card>
        <Button variant="primary" size="md" fullWidth onPress={handleInvite}>
          Send Invite
        </Button>
      </View>
    </View>
  );
}
