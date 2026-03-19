import { Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export function Badge({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'gold' }) {
  const borderColor = tone === 'gold' ? COLORS.gold : COLORS.border;
  const textColor = tone === 'gold' ? COLORS.gold : COLORS.textSecondary;
  return (
    <View style={{ borderWidth: 0.5, borderColor, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
      <Text style={[TYPOGRAPHY.label, { color: textColor, letterSpacing: 1.5 }]}>{label}</Text>
    </View>
  );
}

