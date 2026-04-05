import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type Step = 'email' | 'otp' | 'password';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function ForgotPasswordScreen(props: any) {
  const { navigation } = props;

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const otpVerifyLock = useRef(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  useEffect(() => {
    if (step !== 'otp') return;
    const t = setTimeout(() => otpRefs.current[0]?.focus(), 100);
    return () => clearTimeout(t);
  }, [step]);

  const onSendResetCode = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: 'carbon27://auth/callback',
      });
      if (supaErr) throw supaErr;
      setEmail(trimmed);
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      startCooldown();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'carbon27://auth/callback',
      });
      if (supaErr) throw supaErr;
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
      startCooldown();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runVerifyOtp = useCallback(
    async (token: string) => {
      if (otpVerifyLock.current) return;
      otpVerifyLock.current = true;
      setError(null);
      setLoading(true);
      try {
        const { error: supaErr } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'recovery',
        });
        if (supaErr) throw supaErr;
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

    if (digits.length > 1) {
      const next = [...otp];
      let filled = 0;
      for (let i = index; i < OTP_LENGTH && filled < digits.length; i++, filled++) {
        next[i] = digits[filled];
      }
      setOtp(next);
      const lastFilled = Math.min(index + digits.length - 1, OTP_LENGTH - 1);
      otpRefs.current[lastFilled]?.focus();
      const code = next.join('');
      if (code.length === OTP_LENGTH && !next.includes('')) {
        setTimeout(() => void runVerifyOtp(code), 0);
      }
      return;
    }

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

  const onVerifyPress = () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError(`Enter the full ${OTP_LENGTH}-digit code.`);
      return;
    }
    void runVerifyOtp(code);
  };

  const onResetPassword = async () => {
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error: supaErr } = await supabase.auth.updateUser({ password });
      if (supaErr) throw supaErr;
      navigation.navigate('Login');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = (
    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
      <Text style={[screenStyles.body, { color: COLORS.gold }]}>Back to login</Text>
    </TouchableOpacity>
  );

  const emailStep = (
    <View>
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
        title={loading ? 'LOADING…' : 'SEND RESET CODE'}
        onPress={() => void onSendResetCode()}
        disabled={loading}
      />

      <View style={{ height: 18 }} />
      {backToLogin}
    </View>
  );

  const otpStep = (
    <View>
      <Text style={[screenStyles.body, { marginBottom: 16 }]}>
        Enter the {OTP_LENGTH}-digit code sent to {email}
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
                flex: 1,
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

      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={() => void onResend()} disabled={cooldown > 0 || loading}>
        <Text style={[screenStyles.body, { color: cooldown > 0 ? COLORS.textMuted : COLORS.gold }]}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />
      {backToLogin}
    </View>
  );

  const passwordStep = (
    <View>
      <Input
        label="NEW PASSWORD"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(null);
        }}
        placeholder="••••••••"
        secureTextEntry
      />

      {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}

      <View style={{ height: 18 }} />
      <Button
        title={loading ? 'LOADING…' : 'RESET PASSWORD'}
        onPress={() => void onResetPassword()}
        disabled={loading}
      />

      <View style={{ height: 18 }} />
      {backToLogin}
    </View>
  );

  const stepDots = (['email', 'otp', 'password'] as const).map((s) => (
    <View
      key={s}
      style={
        step === s
          ? { width: 20, height: 6, borderRadius: 3, backgroundColor: COLORS.gold }
          : { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border }
      }
    />
  ));

  return (
    <KeyboardAvoidingView
      style={[screenStyles.screen, { justifyContent: 'center' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
        {stepDots}
      </View>
      <Text style={screenStyles.hero}>Reset password.</Text>
      <View style={{ height: 24 }} />

      {step === 'email' ? emailStep : null}
      {step === 'otp' ? otpStep : null}
      {step === 'password' ? passwordStep : null}
    </KeyboardAvoidingView>
  );
}
