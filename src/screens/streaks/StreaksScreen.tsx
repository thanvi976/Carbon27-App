import { useMemo, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StreakCalendar } from '../../components/charts/StreakCalendar';
import { useStreakStore } from '../../store/streakStore';
import Svg, { Path } from 'react-native-svg';
import { setupNotifications } from '../../services/notifications';

function Flame() {
  return (
    <Svg width={90} height={90} viewBox="0 0 24 24">
      <Path
        d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-2 1-4 2-6 0 2 2 3 2 5 1-1 1-3 0-7z"
        fill={COLORS.gold}
      />
    </Svg>
  );
}

const QUOTES = [
  'Consistency beats intensity.',
  'Small changes, massive impact.',
  'Track it. Improve it. Repeat.',
  'Your planet needs you today.',
];

export function StreaksScreen() {
  const { streakCount, bestStreak, checkInDates, checkIn, notificationsEnabled, setNotificationsEnabled } =
    useStreakStore();
  const [error, setError] = useState<string | null>(null);
  const quote = useMemo(() => QUOTES[(streakCount + bestStreak) % QUOTES.length], [bestStreak, streakCount]);

  const toggle = async (v: boolean) => {
    setError(null);
    setNotificationsEnabled(v);
    if (v) {
      try {
        await setupNotifications();
      } catch (e: any) {
        setError(e?.message ?? 'Could not enable notifications.');
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, padding: 20 }}>
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Text style={[TYPOGRAPHY.score, { color: COLORS.textPrimary }]}>{streakCount}</Text>
        <Flame />
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 10 }]}>DAY STREAK</Text>
      </View>

      <View style={{ height: 18 }} />
      <Card>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>THIS MONTH</Text>
        <View style={{ height: 14 }} />
        <StreakCalendar activeDays={checkInDates} />
      </Card>

      <View style={{ height: 14 }} />
      <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>BEST STREAK</Text>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 8 }]}>{bestStreak} days</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>NOTIFY 9AM</Text>
          <View style={{ height: 8 }} />
          <Switch value={notificationsEnabled} onValueChange={toggle} />
        </View>
      </Card>

      <View style={{ height: 14 }} />
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, fontStyle: 'italic', textAlign: 'center' }]}>
        {quote}
      </Text>

      {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginTop: 10 }]}>{error}</Text> : null}

      <View style={{ flex: 1 }} />
      <Button
        title="CHECK IN TODAY"
        onPress={() => {
          checkIn();
        }}
      />
    </View>
  );
}

