import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

type InputType = 'text' | 'number' | 'email' | 'password';

export type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: InputType;
  suffix?: ReactNode;
  error?: string;
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text',
  suffix,
  error,
}: InputProps) {
  const keyboardType =
    type === 'number' ? 'numeric' : type === 'email' ? 'email-address' : 'default';
  const secureTextEntry = type === 'password';

  return (
    <View className="gap-2">
      <Text className="text-[10px] font-mono uppercase tracking-[1.5px] text-muted">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-xl border bg-bg-3 px-4 py-3 ${
          error ? 'border-red-500/50' : 'border-border'
        }`}
      >
        <TextInput
          className="flex-1 font-body text-base text-white"
          placeholder={placeholder}
          placeholderTextColor="#50505e"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
        {suffix ? <View className="ml-3">{suffix}</View> : null}
      </View>
      {error ? <Text className="font-mono text-[10px] text-red-400">{error}</Text> : null}
    </View>
  );
}
