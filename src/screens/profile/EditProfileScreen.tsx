import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { upsertUser } from '../../services/db';

type AccountType = 'personal' | 'organization';

const orgSizeOptions = ['1–50', '51–100', '101–500', '501–1000', '1000+'] as const;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function EditProfileScreen(props: any) {
  const { navigation } = props;
  const user = useAuthStore.getState().user;
  // Cast to any to access db fields (account_type, org fields) not in CarbonUser type
  const u = user as any;

  const [accountType, setAccountType] = useState<AccountType | null>(
    (u?.account_type as AccountType) ?? null
  );
  const [name, setName] = useState<string>(u?.name ?? '');
  const [orgName, setOrgName] = useState<string>(u?.organization_name ?? '');
  const [orgAddress, setOrgAddress] = useState<string>(u?.organization_address ?? '');
  const [orgEmail, setOrgEmail] = useState<string>(u?.organization_email ?? '');
  const [orgSize, setOrgSize] = useState<string>(u?.organization_size ?? '');
  const [contactName, setContactName] = useState<string>(u?.contact_name ?? '');
  const [contactEmail, setContactEmail] = useState<string>(u?.contact_email ?? '');
  const [contactPhone, setContactPhone] = useState<string>(u?.contact_phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const onSave = async () => {
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError('Enter your name (at least 2 characters).');
      return;
    }
    if (!accountType) {
      setError('Please select an account type.');
      return;
    }
    if (accountType === 'organization') {
      if (!orgName.trim()) { setError('Organization name is required.'); return; }
      if (!orgEmail.trim() || !isValidEmail(orgEmail)) { setError('Enter a valid official contact email.'); return; }
      if (!orgSize.trim()) { setError('Organization size is required.'); return; }
      if (!contactName.trim()) { setError('Contact name is required.'); return; }
      if (!contactEmail.trim() || !isValidEmail(contactEmail)) { setError('Enter a valid contact email.'); return; }
      if (!contactPhone.trim()) { setError('Contact phone is required.'); return; }
    }

    setLoading(true);
    try {
      const updates: Record<string, unknown> = {
        email: user.email,
        name: name.trim(),
        account_type: accountType,
        organization_name: accountType === 'organization' ? orgName.trim() : null,
        organization_address: accountType === 'organization' ? (orgAddress.trim() || null) : null,
        organization_email: accountType === 'organization' ? orgEmail.trim() : null,
        organization_size: accountType === 'organization' ? orgSize : null,
        contact_name: accountType === 'organization' ? contactName.trim() : null,
        contact_email: accountType === 'organization' ? contactEmail.trim() : null,
        contact_phone: accountType === 'organization' ? contactPhone.trim() : null,
      };
      await upsertUser(user.uid, updates);
      useAuthStore.getState().updateUser((prev) => ({ ...prev, ...updates }));
      navigation.goBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    } finally {
      setLoading(false);
    }
  };

  const orgSizeRow = (
    <View style={{ marginBottom: 18 }}>
      <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 4 }]}>ORGANIZATION SIZE</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 10, fontSize: 11 }]}>Select size</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {orgSizeOptions.map((opt) => {
          const selected = orgSize === opt;
          return (
            <TouchableOpacity
              key={opt}
              accessibilityRole="button"
              onPress={() => { setOrgSize(opt); setError(null); }}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: selected ? COLORS.gold : COLORS.border,
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[TYPOGRAPHY.label, { color: selected ? COLORS.gold : COLORS.textPrimary }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          >
            <Text style={[TYPOGRAPHY.body, { color: COLORS.gold }]}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={screenStyles.hero}>Edit Profile.</Text>
          <View style={{ height: 24 }} />

          <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 10 }]}>ACCOUNT TYPE</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => { setError(null); setAccountType('personal'); }}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: accountType === 'personal' ? COLORS.gold : COLORS.border,
                backgroundColor: accountType === 'personal' ? 'rgba(200,184,154,0.08)' : 'transparent',
                padding: 14,
              }}
            >
              <Text style={[TYPOGRAPHY.section, { color: accountType === 'personal' ? COLORS.gold : COLORS.textPrimary }]}>
                👤 Personal
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 4 }]}>
                Track your own carbon footprint
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => { setError(null); setAccountType('organization'); }}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: accountType === 'organization' ? COLORS.gold : COLORS.border,
                backgroundColor: accountType === 'organization' ? 'rgba(200,184,154,0.08)' : 'transparent',
                padding: 14,
              }}
            >
              <Text style={[TYPOGRAPHY.section, { color: accountType === 'organization' ? COLORS.gold : COLORS.textPrimary }]}>
                🏢 Organization
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 4 }]}>
                Manage sustainability for a company or team
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="FULL NAME"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
          />

          {accountType === 'organization' ? (
            <>
              <View style={{ marginTop: 8, marginBottom: 14 }}>
                <View style={{ height: 0.5, backgroundColor: COLORS.border, marginBottom: 14 }} />
                <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, letterSpacing: 1.5 }]}>
                  ORGANIZATION INFORMATION
                </Text>
              </View>

              <Input
                label="ORGANIZATION NAME"
                value={orgName}
                onChangeText={setOrgName}
                placeholder="Company or institution name"
              />
              <Input
                label="ADDRESS"
                value={orgAddress}
                onChangeText={setOrgAddress}
                placeholder="Street, city, country"
              />
              <Input
                label="OFFICIAL CONTACT EMAIL"
                value={orgEmail}
                onChangeText={setOrgEmail}
                placeholder="contact@organization.com"
                keyboardType="email-address"
              />
              {orgSizeRow}

              <View style={{ marginTop: 4, marginBottom: 14 }}>
                <View style={{ height: 0.5, backgroundColor: COLORS.border, marginBottom: 14 }} />
                <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, letterSpacing: 1.5 }]}>
                  POINT OF CONTACT
                </Text>
              </View>

              <Input
                label="CONTACT NAME"
                value={contactName}
                onChangeText={setContactName}
                placeholder="Name of primary contact"
              />
              <Input
                label="CONTACT EMAIL"
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="contact@email.com"
                keyboardType="email-address"
              />
              <Input
                label="CONTACT PHONE NUMBER"
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="+91 9345678900"
                keyboardType="phone-pad"
              />
            </>
          ) : null}

          {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}

          <View style={{ height: 18 }} />
          <Button
            title={loading ? 'SAVING…' : 'SAVE CHANGES'}
            onPress={() => void onSave()}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
