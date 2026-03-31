import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrgStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { createOrganisation, getOrganisation, upsertUser } from '../../services/db';
import { useAuthStore } from '../../store/authStore';
import { useOrgStore } from '../../store/orgStore';

type Props = NativeStackScreenProps<OrgStackParamList, 'CreateOrg'>;

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function CreateOrgScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setOrgId = useOrgStore((s) => s.setOrgId);
  const setOrg = useOrgStore((s) => s.setOrg);

  const inviteCode = useMemo(() => makeCode(), []);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const create = async () => {
    setLoading(true);
    setError(null);
    setOffline(false);
    try {
      if (!user) throw new Error('Not signed in');
      const res = await createOrganisation({ name: name.trim(), adminUid: user.uid, inviteCode });
      const org = await getOrganisation(res.id);
      setOrgId(res.id);
      if (org) setOrg(org);
      const next = { ...user, orgId: res.id };
      setUser(next);
      await upsertUser(user.uid, { orgId: res.id });
      navigation.replace('OrgDashboard');
    } catch (e: any) {
      setOffline(true);
      setError(e?.message ?? 'Could not create org. Offline?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, padding: 20, justifyContent: 'center' }}>
      <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Create Organisation</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 8 }]}>
        Invite code: <Text style={{ color: COLORS.gold }}>{inviteCode}</Text>
      </Text>
      <View style={{ height: 18 }} />
      <Input label="NAME" value={name} onChangeText={setName} placeholder="Carbon27 Team" autoCapitalize="words" />
      {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error }]}>{error}</Text> : null}
      {offline ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Offline mode.</Text> : null}
      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'CREATE'} onPress={create} disabled={loading || name.trim().length < 2} />
    </View>
  );
}

