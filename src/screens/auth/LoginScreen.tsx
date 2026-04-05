import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { loginEmailPassword, signInWithGoogle } from '../../services/auth';
import { TYPOGRAPHY } from '../../constants/typography';

const googleLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.05 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.07 6.16C12.43 13.65 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.67c-.55 2.96-2.2 5.47-4.67 7.15l7.18 5.58C43.44 37.28 46.52 31.36 46.52 24.5z"/>
  <path fill="#FBBC05" d="M10.71 28.62A14.6 14.6 0 0 1 9.5 24c0-1.6.28-3.15.77-4.61l-7.07-6.16A23.93 23.93 0 0 0 0 24c0 3.86.92 7.5 2.55 10.72l8.16-6.1z"/>
  <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.95l-7.18-5.58c-1.88 1.26-4.29 2.03-6.32 2.03-6.26 0-11.57-4.15-13.29-9.88l-8.16 6.1C7.07 41.52 14.82 47 24 47z"/>
</svg>`;

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

export function LoginScreen(props: any) {
  const { navigation } = props;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const email = watch('email');
  const password = watch('password');

  const onGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigation.replace('Main' as never);
    } catch (e: any) {
      setError(e?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      await loginEmailPassword(values.email, values.password);
      // With mock auth (no Firebase Auth), route directly.
      navigation.replace('Main' as never);
    } catch (e: any) {
      setError(e?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={[screenStyles.screen, { justifyContent: 'center' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={screenStyles.hero}>Welcome back.</Text>
      <View style={{ height: 24 }} />

      <Input
        label="EMAIL"
        value={email}
        onChangeText={(t) => setValue('email', t, { shouldValidate: true })}
        placeholder="you@domain.com"
        keyboardType="email-address"
      />
      {errors.email?.message ? <Text style={screenStyles.error}>{errors.email.message}</Text> : null}

      <Input
        label="PASSWORD"
        value={password}
        onChangeText={(t) => setValue('password', t, { shouldValidate: true })}
        placeholder="••••••••"
        secureTextEntry
      />
      {errors.password?.message ? <Text style={screenStyles.error}>{errors.password.message}</Text> : null}

      {error ? (
        <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text>
      ) : null}

      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'CONTINUE'} onPress={onSubmit} disabled={loading} />

      <View style={{ height: 18 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
        <Text style={[screenStyles.body, { color: COLORS.textMuted }]}>or</Text>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border }} />
      </View>

      <View style={{ height: 18 }} />
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
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={[screenStyles.body, { color: COLORS.gold }]}>Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
