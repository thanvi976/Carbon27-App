import { View } from 'react-native';
import { COLORS } from '../../constants/colors';

export function ProgressBar({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height: 1, backgroundColor: COLORS.surface, width: '100%' }}>
      <View style={{ height: 1, backgroundColor: COLORS.gold, width: `${p * 100}%` }} />
    </View>
  );
}

