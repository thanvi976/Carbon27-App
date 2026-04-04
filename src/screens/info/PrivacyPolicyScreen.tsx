import { ScrollView, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';

const sections: { title: string; body: string }[] = [
  {
    title: '1. Who We Are',
    body: 'Carbon27 is a digital sustainability platform accessible at carbon27.ai. We help individuals and organisations understand and reduce their carbon footprint through the Carbon Portrait personal assessment, the Organisational Impact calculator, streak tracking, badges, and educational tools.\n\nFor all privacy-related questions, contact us at developer@carbon27.ai.',
  },
  {
    title: '2. Data We Collect',
    body: 'Data you provide directly:\n\nWhen you use Carbon27, you may submit the following:\n\nYour email address and account credentials upon registration\nYour responses to the Carbon Portrait assessment, including lifestyle, travel, diet, and energy habits\nCompany or organisation data entered into the Organisational Impact calculator\nStreak activity, habit logs, and any other data you voluntarily enter into the platform\n\nData collected automatically via Google Analytics:\n\nWe use Google Analytics 4 to understand how users interact with carbon27.ai. This may include pages visited, features used, session duration, interaction patterns, device and browser type, and approximate location at country or region level only. We do not collect your precise GPS or physical location. Google Analytics collects pseudonymous usage data that cannot directly identify individual users.\n\nData we do not collect:\n\nWe do not collect payment information, government-issued identification, or any sensitive personal data beyond what is strictly necessary to operate Carbon27.',
  },
  {
    title: '3. How We Use Your Data',
    body: 'We use your data solely to operate and improve Carbon27. Specifically to:\n\nCalculate your personal carbon score and generate your Carbon Portrait\nProcess your Organisational Impact report where applicable\nTrack your streak activity, badge progress, and assessment history\nMaintain and secure your account\nImprove platform features, performance, and user experience\nSend you optional product updates or sustainability tips if you have explicitly opted in\n\nWe use your data only for the operation, improvement, and delivery of Carbon27 services.',
  },
  {
    title: '4. Legal Basis for Processing',
    body: 'We process your personal data on the following grounds:\n\nContractual necessity applies when we deliver the platform services you have agreed to use.\nLegitimate interests apply when we maintain, secure, and improve the platform for all users.\nConsent applies to optional communications such as email updates. You may withdraw your consent at any time by contacting developer@carbon27.ai.',
  },
  {
    title: '5. Data Sharing & Third Parties',
    body: 'We do not sell, rent, lease, or trade your personal data to any third party under any circumstances.\n\nTo operate Carbon27, we work with a limited number of trusted third-party service providers for infrastructure hosting, user authentication, database management, email delivery, and analytics (Google Analytics 4). These providers are bound by data processing agreements and are authorised to process your data only as necessary to perform their services on our behalf.\n\nWhere we share aggregated, anonymised statistics, such as collective community impact figures, the data is presented in a form that cannot identify any individual user. These providers process data only as necessary to provide their services to Carbon27 and are required to maintain appropriate data protection safeguards. Some infrastructure providers may process data in different jurisdictions depending on their server locations.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain your personal data for as long as your account is active on Carbon27. If you request account deletion, we will permanently remove your identifiable data from our active systems within a reasonable timeframe, subject to any legal or technical obligations that require us to retain certain records.\n\nAnonymised, non-identifiable data may be retained beyond account deletion for aggregate analytics and platform improvement purposes only.',
  },
  {
    title: '7. Data Security',
    body: 'We apply appropriate technical and organisational measures to protect your data, including encrypted data transmission, secure storage, and access controls. While no digital system can guarantee complete security, we are committed to maintaining robust safeguards and responding promptly to any identified risks or incidents.\n\nIf you believe your Carbon27 account has been compromised, contact us immediately at developer@carbon27.ai.',
  },
  {
    title: '8. Your Rights',
    body: 'Depending on your location and applicable laws, you may have the right to:\n\nAccess: request a copy of the personal data Carbon27 holds about you\nCorrection: request that inaccurate or incomplete data be updated\nDeletion: request permanent deletion of your account and all associated data\nPortability: request your data in a portable, machine-readable format where technically feasible\nObjection: object to certain types of processing where permitted by law\nWithdrawal of consent: withdraw consent for optional communications at any time\n\nTo exercise any of these rights, email developer@carbon27.ai. We will respond within a reasonable timeframe in accordance with applicable laws.',
  },
  {
    title: '9. Data Deletion & Account Closure',
    body: 'You may request permanent deletion of your Carbon27 account and all associated data at any time by emailing developer@carbon27.ai. Upon confirmation, your Carbon Portrait responses, streak history, badge records, Organisational Impact data, and profile information will be permanently removed from our active systems.\n\nSome anonymised, non-identifiable data may be retained for aggregate analytics purposes only and cannot be linked back to you.',
  },
  {
    title: "10. Children's Privacy",
    body: 'Carbon27 is accessible to users aged 13 and above. Users between the ages of 13 and 18 must have the consent of a parent or legal guardian before using the platform.\n\nWe do not knowingly collect personal data from children under 13. If we become aware that a child under 13 has provided personal information without verifiable parental consent, we will delete it promptly. To report a concern, contact developer@carbon27.ai.',
  },
  {
    title: '11. Cookies & Tracking',
    body: 'Carbon27 uses essential cookies to maintain your login session and remember your platform preferences. We use Google Analytics 4 for privacy-respecting usage analytics to understand how users interact with the platform and identify areas for improvement.\n\nWe do not use advertising cookies. We do not use third-party tracking pixels beyond Google Analytics. You may disable cookies through your browser settings, though some platform features may not function as expected as a result.',
  },
  {
    title: '12. Third-Party Links',
    body: 'Carbon27 may contain links to external websites or services. We are not responsible for the privacy practices, content, or data handling of any third-party platforms. We encourage you to review the privacy policies of any external services you access via carbon27.ai.',
  },
  {
    title: '13. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically as the platform evolves or as applicable laws change. When we do, the revised policy will be published at carbon27.ai with an updated effective date.\n\nFor material changes, we will make reasonable efforts to notify active users via email or in-platform notification. Continued use of Carbon27 following any update constitutes your acceptance of the revised policy.',
  },
  {
    title: '14. Contact & Data Enquiries',
    body: 'For questions, concerns, or requests relating to this Privacy Policy or your personal data:\n\nCarbon27\nEmail: developer@carbon27.ai\nWebsite: carbon27.ai\n\nTrack. Reduce. Sustain. Repeat.\n© 2026 Carbon27. All rights reserved',
  },
];

export function PrivacyPolicyScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}>
      <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary, marginBottom: 8 }]}>Privacy Policy</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 28, lineHeight: 22 }]}>
        Effective Date: February 27, 2026 · Version 1.0
      </Text>

      <Card style={{ marginBottom: 28, borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          {
            'At Carbon27, we believe transparency is foundational to trust. This Privacy Policy explains what data we collect, why we collect it, how we use it, and the rights you have over it.\n\nBy accessing or using Carbon27 at carbon27.ai, you acknowledge that you have read and understood this policy. If you do not agree, please discontinue use of the platform.'
          }
        </Text>
      </Card>

      {sections.map((s) => (
        <View key={s.title} style={{ marginBottom: 20 }}>
          <View style={{ borderBottomWidth: 0.5, borderBottomColor: COLORS.border, marginBottom: 12, paddingBottom: 10 }}>
            <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, lineHeight: 26 }]}>{s.title}</Text>
          </View>
          <Card>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>{s.body}</Text>
          </Card>
        </View>
      ))}

      <View style={{ marginTop: 8, paddingTop: 20, borderTopWidth: 0.5, borderTopColor: COLORS.border }}>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 }]}>
          Track. Reduce. Sustain. Repeat.{'\n'}© 2026 Carbon27. All rights reserved
        </Text>
      </View>
    </ScrollView>
  );
}
