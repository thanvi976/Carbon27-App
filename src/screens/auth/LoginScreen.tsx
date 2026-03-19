import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { loginEmailPassword } from '../../services/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

export function LoginScreen(props: any) {
  const { navigation } = props;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const email = watch('email');
  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      await loginEmailPassword(values.email, values.password);
      // With mock auth (no Firebase Auth), route directly.
      navigation.replace('Home' as any);
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
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={[screenStyles.body, { color: COLORS.gold }]}>Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

