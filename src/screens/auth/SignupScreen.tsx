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
import {
  finishSignup,
  sendOtp,
  setPassword,
  verifyOtp,
  type SignupExtraData,
} from '../../services/auth';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type AccountType = 'personal' | 'organization';
type Step = 'email' | 'otp' | 'password' | 'profile';

const OTP_LENGTH = 8;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const orgSizeOptions = ['1–50', '51–100', '101–500', '501–1000', '1000+'] as const;

export function SignupScreen(props: any) {
  const { navigation } = props;
  const [step, setStep] = useState<Step>('email');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPasswordField] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
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
      <Input
        label="PASSWORD"
        value={password}
        onChangeText={(t) => {
          setPasswordField(t);
          setError(null);
        }}
        placeholder="••••••••"
        secureTextEntry
      />
      <Input
        label="CONFIRM PASSWORD"
        value={confirmPassword}
        onChangeText={(t) => {
          setConfirmPassword(t);
          setError(null);
        }}
        placeholder="••••••••"
        secureTextEntry
      />

      {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}

      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'CONTINUE'} onPress={() => void onSetPassword()} disabled={loading} />

      <View style={{ height: 18 }} />
      {backToLogin}
    </View>
  );

  const orgSizeRow = (
    <View style={{ marginBottom: 18 }}>
      <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 8 }]}>ORGANIZATION SIZE</Text>
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
      <Input label="NAME" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />

      {accountType === 'organization' ? (
        <>
          <Input label="ORGANIZATION NAME" value={orgName} onChangeText={setOrgName} placeholder="Your organization" />
          <Input
            label="ORGANIZATION ADDRESS"
            value={orgAddress}
            onChangeText={setOrgAddress}
            placeholder="Optional"
          />
          <Input
            label="OFFICIAL CONTACT EMAIL"
            value={orgEmail}
            onChangeText={setOrgEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
          />
          {orgSizeRow}
          <Input label="CONTACT NAME" value={contactName} onChangeText={setContactName} placeholder="Full name" />
          <Input
            label="CONTACT EMAIL"
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
          />
          <Input
            label="CONTACT PHONE"
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="+1 555 123 4567"
            keyboardType="phone-pad"
          />
        </>
      ) : null}

      {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}

      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'COMPLETE'} onPress={() => void onFinishProfile()} disabled={loading} />

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
  );
}
