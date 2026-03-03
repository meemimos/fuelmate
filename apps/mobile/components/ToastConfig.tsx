import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import type Toast from 'react-native-toast-message';

type ToastProps = ComponentProps<typeof Toast>['config'] extends Record<string, infer V>
  ? V
  : never;

const BaseToast = ({
  text1,
  text2,
  bgColor,
}: {
  text1?: string;
  text2?: string;
  bgColor: string;
}) => (
  <View className="mx-6 mb-6 rounded-2xl px-4 py-3" style={{ backgroundColor: bgColor }}>
    <Text className="text-sm font-semibold text-white">{text1}</Text>
    {text2 ? <Text className="mt-1 text-xs text-white/80">{text2}</Text> : null}
  </View>
);

export const toastConfig: ComponentProps<typeof Toast>['config'] = {
  success: ({ text1, text2 }: ToastProps) => (
    <BaseToast text1={text1} text2={text2} bgColor="#00a877" />
  ),
  error: ({ text1, text2 }: ToastProps) => (
    <BaseToast text1={text1} text2={text2} bgColor="#c0392b" />
  ),
  info: ({ text1, text2 }: ToastProps) => (
    <BaseToast text1={text1} text2={text2} bgColor="#2c2c36" />
  ),
};
