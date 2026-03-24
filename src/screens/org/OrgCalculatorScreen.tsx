import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppHeader } from '../../components/layout/AppHeader';
import Svg, { Path, Circle } from 'react-native-svg';

function IconBuilding({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24">
      <Path d="M4 22V2h10v20H4zm2-2h2v-2H6v2zm0-4h2v-2H6v2zm0-4h2V8H6v2zm0-4h2V4H6v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V8h-2v2zm0-4h2V4h-2v2zm4 8h2V2h6v20h-8v-2zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V8h-2v2zm0-4h2V4h-2v2z" fill={color} />
    </Svg>
  );
}

function IconChart({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24">
      <Path d="M4 19V5h2v14H4zm4 0V9h2v10H8zm4 0v-6h2v6h-2zm4 0V3h2v16h-2z" fill={color} />
    </Svg>
  );
}

function IconTeam({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24">
      <Circle cx="9" cy="8" r="3" fill={color} />
      <Path d="M4 19v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1H4zm10-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill={color} />
    </Svg>
  );
}

export function OrgCalculatorScreen() {
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [totalElectricity, setTotalElectricity] = useState('');
  const [period, setPeriod] = useState('');
  const [employees, setEmployees] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const validate = (): string | null => {
    if (!companyName.trim()) return 'Company name is required.';
    if (!country.trim()) return 'Country is required.';
    if (!state.trim()) return 'State is required.';
    const kwh = Number(totalElectricity);
    if (!Number.isFinite(kwh) || kwh <= 0) return 'Enter a valid total electricity (kWh).';
    const months = Number(period);
    if (!Number.isInteger(months) || months < 1 || months > 12) return 'Period must be a whole month count from 1 to 12.';
    const emp = Number(employees);
    if (!Number.isInteger(emp) || emp < 1) return 'Employees must be at least 1.';
    const em = contactEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return 'Enter a valid contact email.';
    return null;
  };

  const submit = () => {
    const err = validate();
    if (err) {
      Alert.alert('Validation', err);
      return;
    }
    const totalKwh = Number(totalElectricity);
    const periodMonths = Number(period);
    const employeeCount = Number(employees);
    const monthlyKwh = totalKwh / periodMonths;
    const gridFactor = 0.71;
    const monthlyCO2 = (monthlyKwh * gridFactor) / 1000;
    const periodCO2 = monthlyCO2 * periodMonths;
    const co2PerEmployee = periodCO2 / Math.max(1, employeeCount);
    Alert.alert(
      'Calculation complete',
      `Period CO₂ (tonnes): ${periodCO2.toFixed(4)}\nCO₂ per employee (tonnes): ${co2PerEmployee.toFixed(4)}`
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Organisational impact</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 8 }]}>
          Estimate team electricity emissions for the selected period.
        </Text>

        <View style={{ height: 20 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Card style={{ flex: 1, minWidth: '28%', alignItems: 'center', paddingVertical: 14 }}>
            <IconBuilding color={COLORS.sage} />
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginTop: 10 }]}>ENTERPRISE READY</Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '28%', alignItems: 'center', paddingVertical: 14 }}>
            <IconChart color={COLORS.sage} />
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginTop: 10 }]}>TRACK PROGRESS</Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '28%', alignItems: 'center', paddingVertical: 14 }}>
            <IconTeam color={COLORS.sage} />
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginTop: 10 }]}>TEAM INSIGHTS</Text>
          </Card>
        </View>

        <View style={{ height: 22 }} />
        <Input label="COMPANY NAME" value={companyName} onChangeText={setCompanyName} autoCapitalize="words" />
        <Input label="COUNTRY" value={country} onChangeText={setCountry} autoCapitalize="words" />
        <Input label="STATE" value={state} onChangeText={setState} autoCapitalize="words" />
        <Input
          label="TOTAL ELECTRICITY USED IN KWH"
          value={totalElectricity}
          onChangeText={setTotalElectricity}
          keyboardType="numeric"
        />
        <Input
          label="PERIOD IN MONTHS (1–12)"
          value={period}
          onChangeText={setPeriod}
          keyboardType="numeric"
        />
        <Input
          label="NUMBER OF EMPLOYEES"
          value={employees}
          onChangeText={setEmployees}
          keyboardType="numeric"
        />
        <Input
          label="CONTACT EMAIL"
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
        />

        <View style={{ height: 8 }} />
        <Button title="Request Calculation" onPress={submit} />
      </ScrollView>
    </View>
  );
}
