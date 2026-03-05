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
        <View className="px-6 py-10">
          <View>
            <Text className="font-display text-3xl font-bold text-white">Invite to Group</Text>
            <Text className="mt-2 font-body text-sm text-muted">They'll track savings together with you</Text>
          </View>

          <View className="mt-8 gap-5">
            <View>
              <Input label="Email address" value={email} onChangeText={setEmail} type="email" placeholder="friend@example.com" />
            </View>

            <Card variant="info" className="mt-2">
              <Text className="font-body text-xs leading-relaxed text-muted">
                Each member uses their own My 7-Eleven account to lock prices. FuelMate just helps you coordinate and track together.
              </Text>
            </Card>

            <Button variant="accent" size="lg" fullWidth accessibilityLabel="Send invite" onPress={handleInvite}>
              Send Invite
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
