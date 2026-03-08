import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input } from '@fuelmate/ui';
import { showToast } from '@fuelmate/lib';
import { useGroupStore } from '@fuelmate/store';

export default function InviteModal() {
  const router = useRouter();
  const { group, addMember, createGroup } = useGroupStore();

  const [email, setEmail] = useState('');
  const [groupName, setGroupName] = useState(group?.name ?? '');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (group?.name) setGroupName(group.name);
  }, [group?.name]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || creatingGroup) {
      if (!groupName.trim()) showToast('Enter a group name first', 'error');
      return;
    }

    setCreatingGroup(true);
    try {
      await createGroup(groupName.trim());
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleInvite = async () => {
    if (sendingInvite) return;
    if (!group) {
      showToast('Create a group before inviting', 'info');
      return;
    }
    if (!email.trim()) return;

    setSendingInvite(true);
    try {
      await addMember(email.trim());
      router.back();
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-bg">
      <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 py-10">
          <Text className="font-display text-3xl font-bold text-white">Invite to Group</Text>
          <Text className="mt-2 font-body text-sm text-muted">They&apos;ll track savings together with you</Text>

          <View className="mt-6 gap-4">
            {!group ? (
              <Card variant="info" className="mb-2">
                <Text className="mb-1 font-body text-xs font-semibold text-blue-400">Create your group</Text>
                <Text className="font-body text-xs text-muted">Add a group name before sending an invite.</Text>
              </Card>
            ) : (
              <Card className="mb-2">
                <Text className="mb-1 font-body text-xs font-semibold text-muted">Group</Text>
                <Text className="font-display text-base text-white">{group.name}</Text>
              </Card>
            )}

            {!group ? (
              <>
                <Input
                  label="Group name"
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Weekend Roadies"
                />
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  accessibilityLabel="Create group"
                  onPress={handleCreateGroup}
                >
                  {creatingGroup ? 'Creating…' : 'Create Group'}
                </Button>
              </>
            ) : null}

            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              type="email"
              placeholder="friend@example.com"
            />

            <Card variant="info">
              <Text className="mb-2 font-body text-xs font-semibold leading-relaxed text-muted">
                They&apos;ll receive an invite to join your group
              </Text>
              <Text className="font-body text-xs leading-relaxed text-muted">
                Each member uses their own My 7-Eleven account to lock prices. FuelMate helps you coordinate and track savings together.
              </Text>
            </Card>

            <Button
              variant="primary"
              size="md"
              fullWidth
              accessibilityLabel="Send invite"
              icon={<Text className="text-black">→</Text>}
              onPress={handleInvite}
            >
              {sendingInvite ? 'Sending…' : 'Send Invite'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
