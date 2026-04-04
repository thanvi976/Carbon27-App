import { ScrollView, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';

const steps = [
  { num: '01', title: 'Take the Assessment', desc: 'Answer questions about daily habits — travel, food, energy, and consumption — to get a clear picture of your carbon footprint.' },
  { num: '02', title: 'Get Your Score', desc: 'Receive a personalized carbon score and your first achievement marker. A starting point for improvement, not a judgment.' },
  { num: '03', title: 'Track Daily Actions', desc: 'Log everyday sustainable decisions and observe patterns over time. Small actions form measurable consistency.' },
  { num: '04', title: 'Build Progress', desc: 'As habits improve, milestones unlock and your sustainability profile evolves.' },
  { num: '05', title: 'Share Your Impact', desc: 'Download your achievement certificate and share your progress across communities, campuses, or workplaces.' },
  { num: '06', title: 'Reassess and Improve', desc: 'Return periodically to retake the assessment and measure change. Seeing measurable improvement reinforces long-term behavior.' },
];

const pillars = [
  { title: 'Our Goal', desc: 'To simplify carbon measurement and turn environmental awareness into structured, trackable progress for individuals and organizations.' },
  { title: 'Our Community', desc: 'An evolving network of individuals, teams, and businesses committed to measurable environmental responsibility.' },
  { title: 'Our Impact', desc: 'Carbon27 supports sustained behavioral and operational change by providing tools to measure impact and monitor improvement over time.' },
];

export function AboutScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}>
      {/* Hero */}
      <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary, marginBottom: 12 }]}>About Carbon27</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 8, lineHeight: 24 }]}>
        Empowering individuals and organizations to define and reduce their carbon impact through precise insight and ongoing measurement.
      </Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 32, lineHeight: 24 }]}>
        Carbon27 elevates sustainability into a disciplined system — where everyday decisions and operational actions translate into measurable progress.
      </Text>

      {/* Mission */}
      <Card style={{ marginBottom: 12, borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 8 }]}>Our Mission</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          Carbon27 exists to make carbon measurement clear, practical, and actionable. We help individuals understand their footprint and enable organizations to evaluate emissions across operations through structured assessment models.
        </Text>
      </Card>

      {/* Why Carbon27 */}
      <Card style={{ marginBottom: 24, borderLeftWidth: 3, borderLeftColor: COLORS.gold }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 8 }]}>Why Carbon27</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          Many sustainability tools focus solely on calculation. Carbon27 focuses on continuity. Measurement is only the starting point — the platform supports ongoing tracking, structured improvement, and measurable reduction over time.
        </Text>
      </Card>

      {/* Pillars */}
      <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 12 }]}>WHAT WE STAND FOR</Text>
      {pillars.map((p) => (
        <Card key={p.title} style={{ marginBottom: 12 }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.sage, marginBottom: 6 }]}>{p.title}</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>{p.desc}</Text>
        </Card>
      ))}

      {/* How it works */}
      <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 24, marginBottom: 12 }]}>HOW IT WORKS — SIX STEPS</Text>
      {steps.map((s) => (
        <Card key={s.num} style={{ marginBottom: 12, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <Text style={[TYPOGRAPHY.hero, { color: COLORS.gold, fontSize: 28, lineHeight: 32, minWidth: 36 }]}>{s.num}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 4 }]}>{s.title}</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 20 }]}>{s.desc}</Text>
          </View>
        </Card>
      ))}

      {/* Footer */}
      <View style={{ marginTop: 24, padding: 16, borderTopWidth: 0.5, borderTopColor: COLORS.border }}>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center' }]}>
          Track. Reduce. Sustain. Repeat.{'\n'}Carbon27 - Sustainability Platform
        </Text>
      </View>
    </ScrollView>
  );
}
