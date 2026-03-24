import { useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { certificateHTML } from '../../utils/certificate';
import type { LevelName } from '../../constants/levels';

// ✅ CACHE background
let cachedBg: string | null = null;

async function getCertificateBgDataUrl() {
  if (cachedBg) return cachedBg;

  const asset = Asset.fromModule(require('../../../assets/certificate-bg.png'));
  await asset.downloadAsync();

  const uri = asset.localUri ?? asset.uri;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  cachedBg = `data:image/png;base64,${base64}`;
  return cachedBg;
}

export function CertificateScreen({ route }: any) {
  const params = route?.params || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPdf = async () => {
    try {
      const bg = await getCertificateBgDataUrl();

      const certId =
        params?.certId ?? `C27-${Date.now().toString(36).toUpperCase()}`;
      const date =
        params?.date ?? new Date().toDateString();

      const html = certificateHTML(
        params?.name ?? 'User',
        params?.score ?? 0,
        (params?.level as LevelName) ?? 'Carbon Rookie',
        certId,
        date,
        bg
      );

      const res = await Print.printToFileAsync({
        html,
        width: 1280,
        height: 720,
      });
      return res.uri;
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate certificate');
      return null;
    }
  };

  // ✅ DOWNLOAD (actual save)
  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
  
    try {
      const uri = await createPdf();
      if (!uri) return;
  
      // Ask user where to save
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  
      if (!permissions.granted) {
        Alert.alert("Permission denied");
        return;
      }
  
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const newFileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          'carbon27-certificate.pdf',
          'application/pdf'
        );
  
      await FileSystem.writeAsStringAsync(newFileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      Alert.alert('Success', 'Certificate downloaded!');
    } catch (e: any) {
      setError(e?.message ?? 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SHARE
  const handleShare = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const uri = await createPdf();
      if (!uri) return;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Error', 'Sharing not available');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Share failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>
        Certificate
      </Text>

      <Text
        style={[
          TYPOGRAPHY.body,
          { color: COLORS.textMuted, marginTop: 8 },
        ]}
      >
        Generate and share your Carbon27 certificate.
      </Text>

      <View style={{ height: 16 }} />

      <Card>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>
          PREVIEW
        </Text>

        <View style={{ height: 10 }} />

        <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>
          Your certificate will be generated as a high-quality PDF.
        </Text>
      </Card>

      {error && (
        <Text
          style={[
            TYPOGRAPHY.body,
            { color: COLORS.error, marginTop: 12 },
          ]}
        >
          {error}
        </Text>
      )}

      <View style={{ height: 20 }} />

      <Button
        title={loading ? 'LOADING...' : 'DOWNLOAD'}
        onPress={handleDownload}
        disabled={loading}
      />

      <View style={{ height: 12 }} />

      <Button
        title="SHARE"
        variant="secondary"
        onPress={handleShare}
        disabled={loading}
      />
    </ScrollView>
  );
}