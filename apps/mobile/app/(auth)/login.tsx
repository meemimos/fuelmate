import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { Button, Input } from '@fuelmate/ui';
import { useAuthStore } from '@fuelmate/store';
import { supabase } from '@fuelmate/lib';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    setLoading(true);
    try {
      await signIn({ email, password });
      router.replace('/(tabs)/prices');
    } catch (error) {
      Alert.alert('Sign in failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'mobile' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        throw error ?? new Error('Unable to start Google sign-in.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !result.url) {
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (exchangeError) {
        throw exchangeError;
      }

      router.replace('/(tabs)/prices');
    } catch (error) {
      Alert.alert('Google sign in failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 py-10">
      <Text className="text-[24px] font-display font-semibold text-white">Welcome back</Text>
      <Text className="mt-2 font-body text-base text-muted">
        Sign in to sync your price alerts and savings.
      </Text>

      <View className="mt-8 gap-5">
        <Button variant="primary" size="md" fullWidth onPress={handleGoogleSignIn}>
          Continue with Google
        </Button>
        <View className="h-px bg-border/60" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          type="email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          type="password"
        />
        <Button variant="secondary" size="md" fullWidth onPress={handleEmailSignIn}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </View>
    </View>
  );
}
