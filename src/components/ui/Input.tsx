import { TextInput, View, Text, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  style,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}) {
  return (
    <View style={[{ marginBottom: 18 }, style]}>
      {label ? (
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 8 }]}>{label}</Text>
      ) : null}
      <View
        style={{
          backgroundColor: COLORS.bgSecondary,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.border,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={[TYPOGRAPHY.body, { color: COLORS.textPrimary }]}
        />
      </View>
    </View>
  );
}

