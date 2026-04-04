import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppHeader } from '../../components/layout/AppHeader';
import { getBadge, getLevel } from '../../constants/levels';
import { normalizeCarbonUser } from '../../utils/userHelpers';
import { upsertUser } from '../../services/db';
import { logoutUser } from '../../services/auth';
import { getStackNavigator } from '../../navigation/navigateRoot';

export function ProfileScreen() {
  const navigation = useNavigation();
  const stackNav = getStackNavigator(navigation as any);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  const u = user ? normalizeCarbonUser(user) : null;
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');

  const name = u?.name?.trim() || 'Member';
  const email = u?.email ?? '';
  const score = u?.score ?? 0;
  const hasAssessment = Boolean(u?.lastAssessmentDate) || score > 0;

  useEffect(() => {
    if (!editing) setDraftName(name);
  }, [name, editing]);

  const saveName = async () => {
    if (!u) return;
    const nextName = draftName.trim() || u.name;
    updateUser((prev) => ({ ...prev, name: nextName }));
    setEditing(false);
    try {
      await upsertUser(u.uid, { name: nextName });
    } catch {
      // offline — local store already updated
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              borderWidth: 0.5,
              borderColor: COLORS.gold,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[TYPOGRAPHY.hero, { color: COLORS.gold }]}>{(name[0] ?? '?').toUpperCase()}</Text>
          </View>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 14 }]}>{name}</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 4 }]}>{email}</Text>
        </View>

        <View style={{ height: 22 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Card style={{ flex: 1, minWidth: '28%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>BADGE</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 8 }]} numberOfLines={4}>
              {hasAssessment ? getBadge(score) : '—'}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '28%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>LEVEL</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 8 }]}>
              {hasAssessment ? getLevel(score) : getLevel(0)}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '28%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>CARBON SCORE</Text>
            <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 8 }]}>
              {hasAssessment ? String(score) : '--'}
            </Text>
          </Card>
        </View>

        <View style={{ height: 26 }} />
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 12 }]}>ACCOUNT INFORMATION</Text>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>NAME</Text>
            <Button
              title={editing ? 'Save' : 'Edit'}
              variant={editing ? 'primary' : 'secondary'}
              onPress={() => {
                if (editing) saveName();
                else {
                  setDraftName(name);
                  setEditing(true);
                }
              }}
              style={{ height: 44, minWidth: 96, paddingHorizontal: 8 }}
            />
          </View>
          {editing ? (
            <View style={{ marginTop: 12 }}>
              <Input label="" value={draftName} onChangeText={setDraftName} autoCapitalize="words" />
            </View>
          ) : (
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 12 }]}>{name}</Text>
          )}

          <View style={{ height: 20 }} />
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>EMAIL</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 8 }]}>{email}</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6, fontSize: 13 }]}>
            Email cannot be changed
          </Text>

          <View style={{ height: 20 }} />
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>CARBON SCORE</Text>
          {hasAssessment ? (
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 8 }]}>{score}</Text>
          ) : (
            <TouchableOpacity style={{ marginTop: 8 }} onPress={() => stackNav.navigate('AssessmentStart' as never)}>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.sage }]}>Take the assessment</Text>
            </TouchableOpacity>
          )}
        </Card>

        <View style={{ marginBottom: 16 }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 12 }]}>INFO</Text>
          {[
            { label: 'About Us', screen: 'About' },
            { label: 'Contact', screen: 'Contact' },
            { label: 'Privacy Policy', screen: 'PrivacyPolicy' },
            { label: 'Terms of Service', screen: 'Terms' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate(item.screen as never)}
              style={{
                paddingVertical: 14,
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary }]}>{item.label}</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 22 }} />
        <Button
          title="LOG OUT"
          variant="secondary"
          onPress={async () => {
            try {
              await logoutUser();
            } finally {
              setUser(null);
              let current: unknown = navigation;
              while (current) {
                const nav = current as {
                  getState?: () => { routeNames?: string[] };
                  getParent?: () => unknown;
                  reset: (state: { index: number; routes: { name: 'Login' }[] }) => void;
                };
                const routeNames = nav.getState?.()?.routeNames;
                if (routeNames?.includes('Login')) {
                  nav.reset({ index: 0, routes: [{ name: 'Login' }] });
                  return;
                }
                current = nav.getParent?.();
              }
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            }
          }}
        />
      </ScrollView>
    </View>
  );
}
