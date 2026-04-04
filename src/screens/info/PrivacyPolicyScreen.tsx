import { ScrollView, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';

const sections = [
  { title: '1. Who We Are', body: 'Carbon27 is a digital sustainability platform accessible at carbon27.ai. We help individuals and organisations understand and reduce their carbon footprint through the Carbon Portrait personal assessment, the Organisational Impact calculator, streak tracking, badges, and educational tools.\n\nFor all privacy-related questions, contact us at developer@carbon27.ai.' },
  { title: '2. Data We Collect', body: 'When you use Carbon27, you may submit: your email address and account credentials, your responses to the Carbon Portrait assessment, company or organisation data entered into the Organisational Impact calculator, and streak activity and habit logs.\n\nWe use Google Analytics 4 to understand how users interact with the platform. We do not collect payment information or government-issued identification.' },
  { title: '3. How We Use Your Data', body: 'We use your data solely to operate and improve Carbon27 — to calculate your carbon score, process your Organisational Impact report, track your streak activity, maintain your account, and improve platform features.' },
  { title: '4. Data Sharing & Third Parties', body: 'We do not sell, rent, lease, or trade your personal data to any third party under any circumstances. We work with trusted third-party providers for infrastructure, authentication, database management, email delivery, and analytics.' },
  { title: '5. Data Retention', body: 'We retain your personal data for as long as your account is active. If you request account deletion, we will permanently remove your identifiable data from our active systems within a reasonable timeframe.' },
  { title: '6. Your Rights', body: 'You may have the right to access, correct, delete, or port your data. To exercise any of these rights, email developer@carbon27.ai.' },
  { title: '7. Data Security', body: 'We apply appropriate technical and organisational measures to protect your data, including encrypted data transmission, secure storage, and access controls.' },
  { title: '8. Children\'s Privacy', body: 'Carbon27 is accessible to users aged 13 and above. Users between 13 and 18 must have parental or guardian consent. We do not knowingly collect personal data from children under 13.' },
  { title: '9. Contact', body: 'Carbon27\nEmail: developer@carbon27.ai\nWebsite: carbon27.ai\n\nTrack. Reduce. Sustain. Repeat.\n© 2026 Carbon27. All rights reserved.' },
];

export function PrivacyPolicyScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}>
      <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary, marginBottom: 4 }]}>Privacy Policy</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 28 }]}>Effective Date: February 27, 2026 · Version 1.0</Text>

      <Card style={{ marginBottom: 20, borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          At Carbon27, we believe transparency is foundational to trust. This Privacy Policy explains what data we collect, why we collect it, how we use it, and the rights you have over it.
        </Text>
      </Card>

      {sections.map((s) => (
        <View key={s.title} style={{ marginBottom: 16 }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 8 }]}>{s.title}</Text>
          <Card>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>{s.body}</Text>
          </Card>
        </View>
      ))}
    </ScrollView>
  );
}
