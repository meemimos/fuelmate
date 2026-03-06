import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input } from '@fuelmate/ui';
import { useGroupStore } from '@fuelmate/store';

export default function InviteModal() {
  const router = useRouter();
  const { addMember } = useGroupStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = email.includes('@') && email.includes('.');

  const handleInvite = async () => {
    if (!isValidEmail || loading) return;
    try {
      setLoading(true);
      await addMember(email);
      router.back();
    } catch (error) {
      // Error handling is done in addMember via showToast
    } finally {
      setLoading(false);
    }
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

            <Card variant="info">
              <Text className="font-body text-xs leading-relaxed text-muted mb-2 font-semibold">
                They'll receive an invite to join your group
              </Text>
              <Text className="font-body text-xs leading-relaxed text-muted">
                Each member uses their own My 7-Eleven account to lock prices. FuelMate helps you coordinate and track savings together.
              </Text>
            </Card>

            <Button 
              variant="accent" 
              size="lg" 
              fullWidth 
              accessibilityLabel="Send invite"
              onPress={handleInvite}
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
