import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { screenStyles } from '../_shared/styles';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { upsertUser } from '../../services/firestore';

type Props = NativeStackScreenProps<HomeStackParamList, 'EmailCapture'>;

export function EmailCaptureScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setOffline(false);
    try {
      if (!user) throw new Error('Not signed in');
      const next = { ...user, name: name.trim() || user.name, email: email.trim() || user.email };
      setUser(next);
      await upsertUser(user.uid, { name: next.name, email: next.email });
      navigation.navigate('Result');
    } catch (e: any) {
      // Offline fallback: proceed using local state.
      setOffline(true);
      setError(e?.message ?? 'Could not sync. Continuing offline.');
      navigation.navigate('Result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[screenStyles.screen, { justifyContent: 'center' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={{ fontSize: 28, fontWeight: '300', color: '#F5F0E8' }}>Almost there.</Text>
      <View style={{ height: 18 }} />

      <Input label="NAME" value={name} onChangeText={setName} />
      <Input label="EMAIL" value={email} onChangeText={setEmail} keyboardType="email-address" />

      {error ? <Text style={[screenStyles.error, { marginTop: 10 }]}>{error}</Text> : null}
      {offline ? <Text style={[screenStyles.body, { marginTop: 6 }]}>Using cached data—will sync when online.</Text> : null}

      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'SEE MY SCORE'} onPress={submit} disabled={loading} />
    </KeyboardAvoidingView>
  );
}

