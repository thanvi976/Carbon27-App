import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export const screenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bgPrimary, paddingHorizontal: 20, paddingTop: 18 },
  hero: { ...TYPOGRAPHY.hero, color: COLORS.textPrimary },
  section: { ...TYPOGRAPHY.section, color: COLORS.textPrimary },
  body: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  labelGold: { ...TYPOGRAPHY.label, color: COLORS.gold },
  labelSage: { ...TYPOGRAPHY.label, color: COLORS.sage },
  error: { ...TYPOGRAPHY.body, color: COLORS.error },
});

