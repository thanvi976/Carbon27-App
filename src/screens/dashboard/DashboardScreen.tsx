import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuthStore } from '../../store/authStore';
import { getLevel } from '../../constants/levels';
import { normalizeCarbonUser } from '../../utils/userHelpers';
import { getStackNavigator } from '../../navigation/navigateRoot';
import { getStreaks } from '../../services/db';
import Svg, { Path } from 'react-native-svg';

function Chevron({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M9 6l6 6-6 6" fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation();
  const stackNav = getStackNavigator(navigation as any);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const u = user ? normalizeCarbonUser(user) : null;
  const name = u?.name?.trim() || 'there';
  const score = u?.score ?? 0;
  const hasAssessment = Boolean(u?.lastAssessmentDate) || score > 0;
  const [liveStreaks, setLiveStreaks] = useState<any[]>([]);

  useEffect(() => {
    if (!u?.uid) return;
    getStreaks(u.uid).then((data) => {
      setLiveStreaks(data);
    }).catch(() => {});
  }, [u?.uid]);

  const totalStreaks = liveStreaks.reduce((acc, s) => acc + (s.current_streak ?? 0), 0);
  const topStreaks = [...liveStreaks]
    .sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0))
    .slice(0, 5);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.sage} />
      </View>
    );
  }

  const rows: { label: string; onPress: () => void }[] = [
    { label: 'Take Assessment', onPress: () => stackNav.navigate('AssessmentStart' as never) },
    { label: 'Play Carbon Runner 🎮', onPress: () => stackNav.navigate('CarbonRunner' as never) },
    { label: 'Manage Streaks', onPress: () => navigation.navigate('StreaksTab' as never) },
  ];
  if (hasAssessment) {
    rows.push({
      label: 'View Results',
      onPress: () => stackNav.navigate('Result', { score }),
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary }]}>Welcome back, {name}!</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 8 }]}>
          Track your sustainability journey
        </Text>

        <View style={{ height: 22 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Card style={{ flex: 1, minWidth: '45%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>CARBON SCORE</Text>
            <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 10 }]}>
              {hasAssessment ? String(score) : '--'}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '45%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>LEVEL</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 10 }]}>
              {hasAssessment ? getLevel(score) : 'Carbon Rookie'}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '90%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>TOTAL STREAKS</Text>
            <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 10 }]}>{totalStreaks}</Text>
          </Card>
        </View>

        <View style={{ height: 26 }} />
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 12 }]}>QUICK ACTIONS</Text>
        {rows.map((r) => (
          <TouchableOpacity key={r.label} onPress={r.onPress} activeOpacity={0.7}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary }]}>{r.label}</Text>
              <Chevron color={COLORS.textMuted} />
            </Card>
          </TouchableOpacity>
        ))}

        <View style={{ height: 18 }} />
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 12 }]}>RECENT STREAKS</Text>
        {topStreaks.length === 0 ? (
          <Card>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>No streaks yet. Create one!</Text>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => navigation.navigate('StreaksTab' as never)}>
              <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>GO TO STREAKS</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          topStreaks.map((s) => (
            <Card key={s.id} style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, flex: 1 }]}>{s.activity_name}</Text>
              <Text style={[TYPOGRAPHY.section, { color: COLORS.gold }]}>
                {s.current_streak} 🔥
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
