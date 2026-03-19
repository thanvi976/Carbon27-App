import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { HomeStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { certificateHTML } from '../../utils/certificate';
import type { LevelName } from '../../constants/levels';

type Props = NativeStackScreenProps<HomeStackParamList, 'Certificate'>;

export function CertificateScreen({ route }: Props) {
  const params = route.params;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const html = useMemo(() => {
    if (!params) return certificateHTML('Member', 0, 'Carbon Rookie', 'C27-UNKNOWN', new Date().toDateString());
    return certificateHTML(
      params.name,
      params.score,
      params.level as LevelName,
      params.certId,
      params.date
    );
  }, [params]);

  const generatePdf = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await Print.printToFileAsync({ html, base64: false });
      return res.uri;
    } catch (e: any) {
      setError(e?.message ?? 'Could not generate certificate.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    const uri = await generatePdf();
    if (!uri) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Sharing not available.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20 }}>
      <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Certificate</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 8 }]}>
        Generate a printable PDF certificate.
      </Text>

      <View style={{ height: 16 }} />
      <Card>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>PREVIEW</Text>
        <View style={{ height: 10 }} />
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>
          PDF generation uses system fonts + inline styles for maximum compatibility.
        </Text>
      </Card>

      {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginTop: 12 }]}>{error}</Text> : null}
      <View style={{ height: 18 }} />
      <Button title={loading ? 'LOADING…' : 'DOWNLOAD'} onPress={download} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="SHARE" variant="secondary" onPress={download} disabled={loading} />
    </ScrollView>
  );
}

