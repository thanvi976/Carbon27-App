import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { HomeStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import Svg, { Path } from 'react-native-svg';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

function BellIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2z"
        fill={COLORS.gold}
      />
    </Svg>
  );
}

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const score = user?.score ?? 0;
  const level = user?.level ?? 'Carbon Rookie';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.gold, letterSpacing: 4 }]}>CARBON27</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Streaks' as any)}>
          <BellIcon />
        </TouchableOpacity>
      </View>

      <View style={{ height: 34 }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginBottom: 10 }]}>YOUR SCORE</Text>
        <ScoreRing score={score} />

        <View style={{ height: 14 }} />
        <View style={{ borderWidth: 0.5, borderColor: COLORS.gold, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.gold }]}>{String(level).toUpperCase()}</Text>
        </View>
        <View style={{ height: 10 }} />
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, fontStyle: 'italic' }]}>
          {score >= 81 ? 'Top tier impact awareness.' : 'Keep climbing—small habits compound.'}
        </Text>
      </View>

      <View style={{ height: 28 }} />
      <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 12 }]}>THIS WEEK</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        <Card style={{ width: 220 }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>STREAK</Text>
          <View style={{ height: 10 }} />
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>
            {user?.streakCount ?? 0} days
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Check in daily at 9am.</Text>
        </Card>
        <Card style={{ width: 220 }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>SCORE</Text>
          <View style={{ height: 10 }} />
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>{score}/100</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Retake to track growth.</Text>
        </Card>
        <Card style={{ width: 220 }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>BADGES</Text>
          <View style={{ height: 10 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(user?.badges ?? []).slice(0, 3).map((b) => (
              <Badge key={b} label={b.replace(/_/g, ' ')} tone="gold" />
            ))}
            {(user?.badges ?? []).length === 0 ? <Badge label="none yet" /> : null}
          </View>
        </Card>
      </ScrollView>

      <View style={{ height: 22 }} />
      <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 12 }]}>WEEKLY FOCUS</Text>
      <Card style={{ borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>One low-carbon commute</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 8 }]}>
          Swap one drive for walking, biking, or public transport this week.
        </Text>
      </Card>

      <View style={{ height: 18 }} />
      <Button title="RETAKE ASSESSMENT" variant="secondary" onPress={() => navigation.navigate('AssessmentStart')} />
    </ScrollView>
  );
}

