import { Pressable, Text, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type Variant = 'primary' | 'secondary';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: 52,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0,
          backgroundColor: isPrimary ? COLORS.gold : 'transparent',
          borderWidth: isPrimary ? 0 : 0.5,
          borderColor: isPrimary ? 'transparent' : COLORS.gold,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          TYPOGRAPHY.label,
          { color: isPrimary ? COLORS.bgPrimary : COLORS.gold, letterSpacing: 2 },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

