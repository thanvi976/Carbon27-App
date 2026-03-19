import { ScrollView, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreHistoryChart } from '../../components/charts/ScoreHistoryChart';
import { Button } from '../../components/ui/Button';
import { logoutUser } from '../../services/auth';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? 'C';
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? '7';
  return `${a}${b}`.toUpperCase();
}

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const name = user?.name ?? 'Member';
  const email = user?.email ?? '';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            borderWidth: 0.5,
            borderColor: COLORS.gold,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[TYPOGRAPHY.section, { color: COLORS.gold }]}>{initials(name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>{name}</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 2 }]}>{email}</Text>
        </View>
      </View>

      <View style={{ height: 18 }} />
      <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>SCORE</Text>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 8 }]}>{user?.score ?? 0}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>LEVEL</Text>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 8 }]}>{user?.level ?? 'Carbon Rookie'}</Text>
        </View>
      </Card>

      <View style={{ height: 14 }} />
      <Card>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>SCORE HISTORY</Text>
        <View style={{ height: 10 }} />
        <ScoreHistoryChart data={user?.scoreHistory ?? []} />
      </Card>

      <View style={{ height: 14 }} />
      <Card>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>BADGES</Text>
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['water_saver', 'low_carbon_commuter', 'waste_warrior', 'conscious_eater', 'plastic_reducer'] as const).map((b) => {
            const earned = (user?.badges ?? []).includes(b);
            return (
              <View key={b} style={{ opacity: earned ? 1 : 0.3 }}>
                <Badge label={b.replace(/_/g, ' ')} tone={earned ? 'gold' : 'muted'} />
              </View>
            );
          })}
        </View>
      </Card>

      <View style={{ height: 18 }} />
      <Button
        title="LOG OUT"
        variant="secondary"
        onPress={async () => {
          try {
            await logoutUser();
          } finally {
            setUser(null);
          }
        }}
      />
    </ScrollView>
  );
}

