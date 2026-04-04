import { ScrollView, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';

const sections = [
  { title: '1. Platform Description', body: 'Carbon27 is a digital sustainability platform that enables individuals and organisations to measure, track, and improve their environmental impact. Features include Carbon Portrait, Organisational Impact, streak tracking, digital badges and certificates, and educational content.\n\nCarbon27 is intended for informational, educational, and motivational purposes only. It does not constitute professional environmental consulting or certified carbon auditing.' },
  { title: '2. Eligibility & Account Access', body: 'To access Carbon27, you must be at least 13 years of age. Users between 13 and 18 must have parental or guardian consent. All information you provide must be accurate, current, and complete.\n\nYou are solely responsible for maintaining the confidentiality of your login credentials. Contact developer@carbon27.ai if you suspect unauthorised access.' },
  { title: '3. Acceptable Use Policy', body: 'You may not attempt to gain unauthorised access to the platform, use automated scripts or bots, reverse engineer any part of the platform, upload harmful or illegal content, manipulate carbon scores or streaks, or impersonate any person or entity.\n\nViolations may result in immediate account suspension or termination without notice.' },
  { title: '4. Carbon Scores & Certificates', body: 'All carbon scores, insights, and certificates are calculated from self-reported user inputs and publicly available emissions data. They are estimates for personal awareness and educational purposes only. They do not constitute official or certified environmental assessments and cannot be used for regulatory compliance.' },
  { title: '5. Intellectual Property', body: 'All intellectual property rights in Carbon27 — including the brand name, logo, interface design, codebase, and content — are the exclusive property of Carbon27 or its licensors. You may not reproduce or commercially exploit any part of the platform without prior written consent.' },
  { title: '6. Limitation of Liability', body: 'Carbon27 is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages, loss of data, or decisions made in reliance on platform outputs.\n\nIn no event shall Carbon27\'s total liability exceed the amount paid by the user, if any, for access to the platform.' },
  { title: '7. Termination', body: 'Users may discontinue use and request account deletion by contacting developer@carbon27.ai. Carbon27 reserves the right to suspend or permanently terminate any account that violates these Terms.' },
  { title: '8. Contact & Legal Notices', body: 'Carbon27\nEmail: developer@carbon27.ai\nWebsite: carbon27.ai\n\nTrack. Reduce. Sustain. Repeat.\nCarbon27 - Sustainability Platform' },
];

export function TermsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}>
      <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary, marginBottom: 4 }]}>Terms of Service</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 28 }]}>Effective Date: February 27, 2026</Text>

      <Card style={{ marginBottom: 20, borderLeftWidth: 3, borderLeftColor: COLORS.gold }}>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          These Terms constitute a legally binding agreement between you and Carbon27 governing your access to and use of the Carbon27 platform at carbon27.ai. By using Carbon27, you agree to be bound by these Terms.
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
