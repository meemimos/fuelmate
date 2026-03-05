import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input } from '@fuelmate/ui';
import { showToast } from '@fuelmate/lib';
import { useGroupStore } from '@fuelmate/store';

export default function InviteModal() {
  const router = useRouter();
  const { addMember } = useGroupStore();
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    if (!email) return;
    await addMember(email);
    showToast(`Invite sent to ${email}`, 'success');
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-bg">
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-8">
          <Text className="font-display text-2xl text-white">Invite to Group</Text>
          <Text className="mt-2 font-body text-base text-muted">They'll track savings together with you</Text>

          <View className="mt-6 gap-4">
            <Input label="Email address" value={email} onChangeText={setEmail} type="email" placeholder="friend@example.com" />

            <Card variant="savings" className="mb-5">
              <Text className="font-body text-xs leading-relaxed text-muted">
                Each member uses their own My 7-Eleven account to lock prices. FuelMate just helps you coordinate and track together.
              </Text>
            </Card>

            <Button variant="primary" size="md" fullWidth accessibilityLabel="Send invite" icon={<Text className="text-black">→</Text>} onPress={handleInvite}>
              Send Invite
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
