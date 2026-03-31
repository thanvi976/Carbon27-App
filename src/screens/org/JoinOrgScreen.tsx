import { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrgStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { joinOrganisation, getOrganisation, upsertUser } from '../../services/db';
import { useAuthStore } from '../../store/authStore';
import { useOrgStore } from '../../store/orgStore';

type Props = NativeStackScreenProps<OrgStackParamList, 'JoinOrg'>;

export function JoinOrgScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setOrgId = useOrgStore((s) => s.setOrgId);
  const setOrg = useOrgStore((s) => s.setOrg);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const join = async () => {
    setLoading(true);
    setError(null);
    setOffline(false);
    try {
      if (!user) throw new Error('Not signed in');
      const orgId = await joinOrganisation({ uid: user.uid, inviteCode: code.trim() });
      const org = await getOrganisation(orgId);
      setOrgId(orgId);
      if (org) setOrg(org);
      const next = { ...user, orgId };
      setUser(next);
      await upsertUser(user.uid, { orgId });
      navigation.replace('OrgDashboard');
    } catch (e: any) {
      setOffline(true);
      setError(e?.message ?? 'Could not join org. Offline?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, padding: 20, justifyContent: 'center' }}>
      <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Join Organisation</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 8 }]}>Enter the 6-character invite code.</Text>
      <View style={{ height: 18 }} />
      <Input label="INVITE CODE" value={code} onChangeText={setCode} autoCapitalize="characters" />
      {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error }]}>{error}</Text> : null}
      {offline ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Offline mode.</Text> : null}
      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'JOIN'} onPress={join} disabled={loading || code.trim().length < 6} />
    </View>
  );
}

