import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import emailjs from '@emailjs/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrgStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { screenStyles } from '../_shared/styles';

const EMAILJS_SERVICE_ID = 'service_zkcwuvo';
const EMAILJS_TEMPLATE_ID = 'template_y0cyrp8';
const EMAILJS_PUBLIC_KEY = 'Qs0QubXnQxIObPD6H';

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

type Props = NativeStackScreenProps<OrgStackParamList, 'OrgImpact'>;

export function OrgImpactScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [totalElectricity, setTotalElectricity] = useState('');
  const [period, setPeriod] = useState('');
  const [employees, setEmployees] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    if (!companyName.trim()) { setError('Company name is required.'); return; }
    if (!country.trim()) { setError('Country is required.'); return; }
    if (!state.trim()) { setError('State is required.'); return; }
    if (!totalElectricity.trim() || isNaN(Number(totalElectricity))) { setError('Enter a valid electricity value.'); return; }
    if (!period.trim() || isNaN(Number(period)) || Number(period) < 1 || Number(period) > 12) { setError('Period must be between 1 and 12 months.'); return; }
    if (!employees.trim() || isNaN(Number(employees)) || Number(employees) < 1) { setError('Enter a valid number of employees.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid contact email.'); return; }

    const monthlyKwh = Number(totalElectricity) / Number(period);
    const gridFactor = 0.71;
    const monthlyCO2 = (monthlyKwh * gridFactor) / 1000;
    const periodCO2 = monthlyCO2 * Number(period);
    const emp = Math.max(1, Number(employees));
    const co2PerEmployee = periodCO2 / emp;

    setLoading(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          company_name: companyName.trim(),
          country: country.trim(),
          state: state.trim(),
          total_electricity: totalElectricity.trim(),
          period: period.trim(),
          employees: employees.trim(),
          email: email.trim(),
          period_co2: periodCO2.toFixed(4),
          co2_per_employee: co2PerEmployee.toFixed(4),
        }
      );

      setSubmitted(true);
      setCompanyName('');
      setCountry('');
      setState('');
      setTotalElectricity('');
      setPeriod('');
      setEmployees('');
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e: any) {
      console.log('EmailJS error:', JSON.stringify(e), e?.message, e?.status, e?.text)
      setError(e?.message ?? 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: insets.top + 12,
          paddingBottom: 12,
        }}
      >
        <Text style={{ color: COLORS.gold, fontSize: 18, marginRight: 4 }}>←</Text>
        <Text style={{ color: COLORS.gold, fontSize: 14, letterSpacing: 0.5 }}>Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 4 }]}>
          Organisational Impact
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 24 }]}>
          Calculate your company's carbon footprint and get actionable insights.
        </Text>

        <Input label="COMPANY NAME" value={companyName} onChangeText={setCompanyName} placeholder="Your company name" />
        <Input label="COUNTRY" value={country} onChangeText={setCountry} placeholder="Country" />
        <Input label="STATE" value={state} onChangeText={setState} placeholder="State" />
        <Input
          label="TOTAL ELECTRICITY USED (kWh)"
          value={totalElectricity}
          onChangeText={setTotalElectricity}
          placeholder="10000"
          keyboardType="numeric"
        />
        <Input
          label="PERIOD (MONTHS 1–12)"
          value={period}
          onChangeText={setPeriod}
          placeholder="12"
          keyboardType="numeric"
        />
        <Input
          label="NUMBER OF EMPLOYEES"
          value={employees}
          onChangeText={setEmployees}
          placeholder="100"
          keyboardType="numeric"
        />
        <Input
          label="CONTACT EMAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="contact@company.com"
          keyboardType="email-address"
        />

        {error ? (
          <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginTop: 10 }]}>{error}</Text>
        ) : null}

        <View style={{ height: 18 }} />
        <Button
          title={loading ? 'SENDING…' : submitted ? 'REQUEST SENT!' : 'REQUEST CALCULATION'}
          onPress={onSubmit}
          disabled={loading || submitted}
        />

        <View style={{ height: 18 }} />
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center' }]}>
          Our team will analyze your data and provide a comprehensive carbon footprint report within 2–3 business days.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
