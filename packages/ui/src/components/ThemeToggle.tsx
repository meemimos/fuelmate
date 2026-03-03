import { setBackgroundColorAsync } from 'expo-system-ui';
import type { ColorSchemeName } from 'react-native';
import { Appearance, Pressable, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleScheme = async () => {
    const nextScheme: ColorSchemeName = isDark ? 'light' : 'dark';
    setColorScheme(nextScheme);
    await setBackgroundColorAsync(nextScheme === 'dark' ? '#0c0c0e' : '#ffffff');
    (Appearance as unknown as { setColorScheme?: (scheme: ColorSchemeName) => void })
      .setColorScheme?.(nextScheme);
  };

  return (
    <Pressable
      onPress={toggleScheme}
      className="rounded-full border border-border bg-bg-3 px-3 py-2"
    >
      <Text className="font-mono text-xs uppercase tracking-[1.2px] text-muted">
        {isDark ? 'Dark' : 'Light'}
      </Text>
    </Pressable>
  );
}
