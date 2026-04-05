import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrgStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useOrgStore } from '../../store/orgStore';
import { getOrganisation, getOrganisationLeaderboard } from '../../services/db';

type Props = NativeStackScreenProps<OrgStackParamList, 'OrgDashboard'>;

export function OrgDashboardScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const orgId = useOrgStore((s) => s.orgId);
  const org = useOrgStore((s) => s.org);
  const setOrg = useOrgStore((s) => s.setOrg);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ uid: string; name: string; score: number; rank: number }[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      setOffline(false);
      try {
        const id = orgId ?? user?.orgId ?? null;
        if (!id) return;
        const o = await getOrganisation(id);
        if (o && mounted) setOrg(o);
        const lb = await getOrganisationLeaderboard(id);
        if (mounted) setLeaderboard(lb);
      } catch (e: any) {
        setOffline(true);
        setError(e?.message ?? 'Could not load org. Offline?');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orgId, setOrg, user?.orgId]);

  const activeOrg = org ?? null;
  const avg =
    leaderboard.length > 0
      ? Math.round(leaderboard.reduce((acc, m) => acc + (m.score ?? 0), 0) / leaderboard.length)
      : 0;

  if (!activeOrg) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, padding: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 32 }}
        >
          <Text style={{ color: COLORS.gold, fontSize: 18, marginRight: 4 }}>←</Text>
          <Text style={{ color: COLORS.gold, fontSize: 14, letterSpacing: 0.5 }}>Back</Text>
        </TouchableOpacity>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Organisation</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 10 }]}>
          Create or join an organisation to compare progress.
        </Text>
        {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginTop: 10 }]}>{error}</Text> : null}
        {offline ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Offline mode.</Text> : null}
        <View style={{ height: 18 }} />
        <Button title="CREATE ORG" onPress={() => navigation.navigate('CreateOrg')} />
        <View style={{ height: 12 }} />
        <Button title="JOIN ORG" variant="secondary" onPress={() => navigation.navigate('JoinOrg')} />
        <View style={{ height: 12 }} />
        <Button title="ORGANISATIONAL IMPACT" onPress={() => navigation.navigate('OrgImpact')} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20 }}>
      <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>{activeOrg.name}</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>
        Invite code: <Text style={{ color: COLORS.gold }}>{activeOrg.inviteCode}</Text>
      </Text>

      {loading ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 10 }]}>Loading…</Text> : null}
      {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginTop: 10 }]}>{error}</Text> : null}
      {offline ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Offline mode.</Text> : null}

      <View style={{ height: 14 }} />
      <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>AVERAGE SCORE</Text>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 8 }]}>{avg}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>MEMBERS</Text>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 8 }]}>{leaderboard.length}</Text>
        </View>
      </Card>

      <View style={{ height: 14 }} />
      <Card>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>LEADERBOARD</Text>
        <View style={{ height: 10 }} />
        {leaderboard.length === 0 ? (
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted }]}>No members yet.</Text>
        ) : (
          leaderboard.slice(0, 10).map((m) => (
            <View
              key={m.uid}
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border }}
            >
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary }]}>
                {m.rank}. {m.name}
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.gold }]}>{m.score}</Text>
            </View>
          ))
        )}
      </Card>

      <View style={{ height: 14 }} />
      <Button title="ORGANISATIONAL IMPACT" onPress={() => navigation.navigate('OrgImpact')} />
    </ScrollView>
  );
}

