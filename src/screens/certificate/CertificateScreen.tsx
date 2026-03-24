import { useRef, useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CertificateView } from './CertificateView';
import { isoNow } from '../../utils/dateHelpers';

export function CertificateScreen({ route }: any) {
  const params = route?.params || {};
  const certRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const certId =
    params?.certId ?? `C27-${Date.now().toString(36).toUpperCase()}`;

  const date = params?.date ?? isoNow();

  const capturecertificate = async (): Promise<string | null> => {
    try {
      // Longer delay ensures Image fully renders on Android before capture
      await new Promise<void>(res => setTimeout(() => res(), 800));

      const uri = await captureRef(certRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: 1280,
        height: 720,
      });

      return uri;
    } catch (e: any) {
      console.error('Capture failed:', e);
      setError(e?.message ?? 'Failed to capture certificate');
      return null;
    }
  };

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const uri = await capturecertificate();
      if (!uri) return;

      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert('Permission denied');
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const newFileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          'carbon27-certificate.png',
          'image/png'
        );

      await FileSystem.writeAsStringAsync(newFileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert('Success', 'Certificate saved!');
    } catch (e: any) {
      setError(e?.message ?? 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const uri = await capturecertificate();
      if (!uri) return;

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Carbon27 Certificate',
      });
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
          Your certificate will be generated as a high-quality image.
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

      {/* Hidden certificate view — opacity:0 keeps it rendered but invisible */}
      {/* Do NOT use top:-2000 as Android may skip rendering off-screen views */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.01,          // invisible but still rendered
          pointerEvents: 'none',
        }}
      >
        <CertificateView
          ref={certRef}
          data={{
            ...params,
            certId,
            date,
          }}
        />
      </View>
    </ScrollView>
  );
}