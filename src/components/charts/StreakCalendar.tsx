import { View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { daysInMonth } from '../../utils/dateHelpers';

export function StreakCalendar({ activeDays }: { activeDays: string[] }) {
  // activeDays: array of ISO dates where user checked in; compare by YYYY-MM-DD.
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const total = daysInMonth(year, month);
  const active = new Set(activeDays.map((d) => d.slice(0, 10)));

  const dots = Array.from({ length: total }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const iso = date.toISOString().slice(0, 10);
    const isActive = active.has(iso);
    return { key: iso, isActive };
  });

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {dots.map((d) => (
        <View
          key={d.key}
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            backgroundColor: d.isActive ? COLORS.gold : COLORS.surface,
            opacity: d.isActive ? 1 : 0.6,
          }}
        />
      ))}
    </View>
  );
}

