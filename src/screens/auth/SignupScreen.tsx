import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthStackParamList } from '../../navigation/types';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { signupEmailPassword } from '../../services/auth';
import { upsertUser } from '../../services/firestore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

export function SignupScreen({ navigation }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } });

  const name = watch('name');
  const email = watch('email');
  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      const user = await signupEmailPassword(values.name, values.email, values.password);
      // Pre-create Firestore user record so downstream reads succeed even on first boot.
      await upsertUser(user.uid, {
        uid: user.uid,
        name: values.name.trim(),
        email: values.email.trim(),
        score: 0,
        level: 'Carbon Rookie',
        badges: [],
        responses: {},
        streakCount: 0,
        bestStreak: 0,
        lastCheckIn: null,
        lastAssessmentDate: null,
        scoreHistory: [],
        certificateId: null,
        orgId: null,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={[screenStyles.screen, { justifyContent: 'center' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={screenStyles.hero}>Create account.</Text>
      <View style={{ height: 24 }} />

      <Input label="NAME" value={name} onChangeText={(t) => setValue('name', t, { shouldValidate: true })} />
      {errors.name?.message ? <Text style={screenStyles.error}>{errors.name.message}</Text> : null}

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
      <Button title={loading ? 'LOADING…' : 'CREATE ACCOUNT'} onPress={onSubmit} disabled={loading} />

      <View style={{ height: 18 }} />
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={[screenStyles.body, { color: COLORS.gold }]}>Log in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

