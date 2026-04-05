import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import {
  finishSignup,
  sendOtp,
  setPassword,
  signInWithGoogle,
  verifyOtp,
  type SignupExtraData,
} from '../../services/auth';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const googleLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.05 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.07 6.16C12.43 13.65 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.67c-.55 2.96-2.2 5.47-4.67 7.15l7.18 5.58C43.44 37.28 46.52 31.36 46.52 24.5z"/>
  <path fill="#FBBC05" d="M10.71 28.62A14.6 14.6 0 0 1 9.5 24c0-1.6.28-3.15.77-4.61l-7.07-6.16A23.93 23.93 0 0 0 0 24c0 3.86.92 7.5 2.55 10.72l8.16-6.1z"/>
  <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.95l-7.18-5.58c-1.88 1.26-4.29 2.03-6.32 2.03-6.26 0-11.57-4.15-13.29-9.88l-8.16 6.1C7.07 41.52 14.82 47 24 47z"/>
</svg>`;

type AccountType = 'personal' | 'organization';
type Step = 'email' | 'otp' | 'password' | 'profile';

const OTP_LENGTH = 8;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const orgSizeOptions = ['1–50', '51–100', '101–500', '501–1000', '1000+'] as const;

export function SignupScreen(props: any) {
  const { navigation, route } = props;
  const initialStep: Step = route?.params?.step ?? 'email';
  const initialName: string = route?.params?.googleName ?? '';
  const [step, setStep] = useState<Step>(initialStep);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPasswordField] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(initialName);
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const otpVerifyLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dotActive = { width: 20, height: 6, borderRadius: 3, backgroundColor: COLORS.gold };
  const dotInactive = { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border };

  const runVerifyOtp = useCallback(
    async (token: string) => {
      if (otpVerifyLock.current) return;
      otpVerifyLock.current = true;
      setError(null);
      setLoading(true);
      try {
        await verifyOtp(email.trim(), token);
        setStep('password');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Verification failed. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        otpRefs.current[0]?.focus();
      } finally {
        setLoading(false);
        otpVerifyLock.current = false;
      }
    },
    [email]
  );

  const onOtpChange = (index: number, text: string) => {
    setError(null);
    const digits = text.replace(/\D/g, '');
    if (digits.length === 0) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }

    // Handle paste or autofill — multiple digits at once
    if (digits.length > 1) {
      const next = [...otp];
      let filled = 0;
      for (let i = index; i < OTP_LENGTH && filled < digits.length; i++, filled++) {
        next[i] = digits[filled];
      }
      setOtp(next);
      // Focus the last filled box or the last box
      const lastFilled = Math.min(index + digits.length - 1, OTP_LENGTH - 1);
      otpRefs.current[lastFilled]?.focus();
      // Auto verify if all filled
      const code = next.join('');
      if (code.length === OTP_LENGTH && !next.includes('')) {
        setTimeout(() => void runVerifyOtp(code), 0);
      }
      return;
    }

    // Single digit — existing behaviour
    const digit = digits.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    } else {
      const code = next.join('');
      if (code.length === OTP_LENGTH) {
        setTimeout(() => void runVerifyOtp(code), 0);
      }
    }
  };

  const onOtpKeyPress = (index: number, key: string) => {
    if (key !== 'Backspace') return;
    if (otp[index]) return;
    if (index <= 0) return;
    const next = [...otp];
    next[index - 1] = '';
    setOtp(next);
    otpRefs.current[index - 1]?.focus();
  };

  useEffect(() => {
    if (step !== 'otp') return;
    const t = setTimeout(() => otpRefs.current[0]?.focus(), 100);
    return () => clearTimeout(t);
  }, [step]);

  const onGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { isNewUser, googleName } = await signInWithGoogle();
      if (isNewUser) {
        setName(googleName);
        setStep('profile');
      }
      // Existing user: store is updated; RootNavigator switches automatically
    } catch (e: any) {
      setError(e?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSendOtp = async () => {
    setError(null);
    if (!accountType) {
      setError('Please select an account type.');
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(trimmed);
      setEmail(trimmed);
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('otp');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Enter the full 8-digit code.');
      return;
    }
    void runVerifyOtp(code);
  };

  const onSetPassword = async () => {
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await setPassword(password);
      setStep('profile');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not set password.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishProfile = async () => {
    setError(null);
    if (!accountType) {
      setError('Missing account type.');
      return;
    }
    if (!name.trim() || name.trim().length < 2) {
      setError('Enter your name (at least 2 characters).');
      return;
    }

    let extra: SignupExtraData = { account_type: accountType };

    if (accountType === 'organization') {
      if (!orgName.trim()) {
        setError('Organization name is required.');
        return;
      }
      if (!orgEmail.trim() || !isValidEmail(orgEmail)) {
        setError('Enter a valid official contact email.');
        return;
      }
      if (!orgSize.trim()) {
        setError('Organization size is required.');
        return;
      }
      if (!contactName.trim()) {
        setError('Contact name is required.');
        return;
      }
      if (!contactEmail.trim() || !isValidEmail(contactEmail)) {
        setError('Enter a valid contact email.');
        return;
      }
      if (!contactPhone.trim()) {
        setError('Contact phone is required.');
        return;
      }
      extra = {
        account_type: 'organization',
        organization_name: orgName.trim(),
        organization_address: orgAddress.trim() || null,
        organization_email: orgEmail.trim(),
        organization_size: orgSize,
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
      };
    }

    setLoading(true);
    try {
      await finishSignup(name.trim(), extra, () => {
        navigation.replace('Main' as never);
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not complete signup.');
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {(['email', 'otp', 'password', 'profile'] as const).map((s) => (
          <View key={s} style={step === s ? dotActive : dotInactive} />
        ))}
      </View>
      <Text style={screenStyles.hero}>Create account.</Text>
      <View style={{ height: 24 }} />
    </View>
  );

  const backToLogin = (
    <TouchableOpacity onPress={() => navigation.replace('Login')}>
      <Text style={[screenStyles.body, { color: COLORS.gold }]}>Back to login</Text>
    </TouchableOpacity>
  );

  const emailStep = (
    <View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            setError(null);
            setAccountType('personal');
          }}
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
          <Text
            style={[
              TYPOGRAPHY.body,
              { color: accountType === 'personal' ? COLORS.textSecondary : COLORS.textSecondary, marginTop: 4 },
            ]}
          >
            Track your own carbon footprint
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            setError(null);
            setAccountType('organization');
          }}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: accountType === 'organization' ? COLORS.gold : COLORS.border,
            backgroundColor: accountType === 'organization' ? 'rgba(200,184,154,0.08)' : 'transparent',
            padding: 14,
          }}
        >
          <Text
            style={[
              TYPOGRAPHY.section,
              { color: accountType === 'organization' ? COLORS.gold : COLORS.textPrimary },
            ]}
          >
            🏢 Organization
          </Text>
          <Text
            style={[
              TYPOGRAPHY.body,
              { color: accountType === 'organization' ? COLORS.textSecondary : COLORS.textSecondary, marginTop: 4 },
            ]}
          >
            Manage sustainability for a company or team
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 18 }} />

      <Input
        label="EMAIL"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setError(null);
        }}
        placeholder="you@domain.com"
        keyboardType="email-address"
      />

      {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}

      <View style={{ height: 18 }} />
      <Button
        title={loading ? 'LOADING…' : 'SEND OTP'}
        onPress={() => void onSendOtp()}
        disabled={loading || !accountType}
      />

      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted }]}>or</Text>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
      </View>
      <View style={{ height: 12 }} />
      <TouchableOpacity
        onPress={onGoogleSignIn}
        disabled={googleLoading}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderWidth: 1,
          borderColor: COLORS.border,
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: 'transparent',
        }}
      >
        <SvgXml xml={googleLogo} width={20} height={20} />
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textPrimary }]}>
          {googleLoading ? 'SIGNING IN…' : 'CONTINUE WITH GOOGLE'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 18 }} />
      {backToLogin}
    </View>
  );

  const otpStep = (
    <View>
      <Text style={[screenStyles.body, { marginBottom: 16 }]}>
        Enter the 8-digit code sent to {email}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 18 }}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(r) => {
              otpRefs.current[index] = r;
            }}
            value={digit}
            onChangeText={(t) => onOtpChange(index, t)}
            onKeyPress={({ nativeEvent }) => onOtpKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            selectTextOnFocus
            editable={!loading}
            style={[
              TYPOGRAPHY.section,
              {
                width: 36,
                height: 48,
                textAlign: 'center',
                color: COLORS.textPrimary,
                backgroundColor: COLORS.bgSecondary,
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.border,
              },
            ]}
          />
        ))}
      </View>

      {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}

      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'VERIFY'} onPress={onVerifyPress} disabled={loading} />

      <View style={{ height: 18 }} />
      {backToLogin}
    </View>
  );

  const passwordStep = (
    <View>
      <View style={{ marginBottom: 18 }}>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 8 }]}>PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <Input
            label=""
            value={password}
            onChangeText={(t) => { setPasswordField(t); setError(null); }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            style={{ marginBottom: 0 }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 18 }}>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 8 }]}>CONFIRM PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <Input
            label=""
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
            placeholder="••••••••"
            secureTextEntry={!showConfirmPassword}
            style={{ marginBottom: 0 }}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}

      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'CONTINUE'} onPress={() => void onSetPassword()} disabled={loading} />

      <View style={{ height: 18 }} />
      {backToLogin}
    </View>
  );

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
              onPress={() => {
                setOrgSize(opt);
                setError(null);
              }}
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

  const profileStepInner = (
    <>
      {accountType !== null ? (
        <TouchableOpacity
          onPress={() => { setAccountType(null); setError(null); }}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
        >
          <Text style={[TYPOGRAPHY.body, { color: COLORS.gold }]}>‹ Back</Text>
        </TouchableOpacity>
      ) : null}

      {accountType === null ? (
        <>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => { setError(null); setAccountType('personal'); }}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: 'transparent',
                padding: 14,
              }}
            >
              <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>👤 Personal</Text>
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
                borderColor: COLORS.border,
                backgroundColor: 'transparent',
                padding: 14,
              }}
            >
              <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>🏢 Organization</Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 4 }]}>
                Manage sustainability for a company or team
              </Text>
            </TouchableOpacity>
          </View>
          {error ? <Text style={[screenStyles.error, { marginBottom: 10 }]}>{error}</Text> : null}
        </>
      ) : null}

      <Input label="FULL NAME" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />

      {accountType === 'organization' ? (
        <>
          {/* Organization Information */}
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

          {/* Point of Contact */}
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
      <Button title={loading ? 'LOADING…' : 'COMPLETE SIGNUP'} onPress={() => void onFinishProfile()} disabled={loading} />

      <View style={{ height: 18 }} />
      {backToLogin}
    </>
  );

  const profileStep = (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
      {profileStepInner}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <KeyboardAvoidingView
        style={[
          screenStyles.screen,
          { justifyContent: step === 'profile' ? 'flex-start' : 'center' },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {header}
        {step === 'email' ? emailStep : null}
        {step === 'otp' ? otpStep : null}
        {step === 'password' ? passwordStep : null}
        {step === 'profile' ? profileStep : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
