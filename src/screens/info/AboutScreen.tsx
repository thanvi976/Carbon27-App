import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';

const pillars = [
  {
    title: 'Our Goal',
    desc: 'To simplify carbon measurement and turn environmental awareness into structured, trackable progress for individuals and organizations.',
  },
  {
    title: 'Our Community',
    desc: 'An evolving network of individuals, teams, and businesses committed to measurable environmental responsibility.',
  },
  {
    title: 'Our Impact',
    desc: 'Carbon27 supports sustained behavioral and operational change by providing tools to measure impact and monitor improvement over time.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Take the Assessment',
    desc: 'Answer questions about daily habits — travel, food, energy, and consumption — to get a clear picture of your carbon footprint.',
  },
  {
    num: '02',
    title: 'Get Your Score',
    desc: 'Receive a personalized carbon score and your first achievement marker. A starting point for improvement, not a judgment.',
  },
  {
    num: '03',
    title: 'Track Daily Actions',
    desc: 'Log everyday sustainable decisions and observe patterns over time. Small actions form measurable consistency.',
  },
  {
    num: '04',
    title: 'Build Progress',
    desc: 'As habits improve, milestones unlock and your sustainability profile evolves.',
  },
  {
    num: '05',
    title: 'Share Your Impact',
    desc: 'Download your achievement certificate and share your progress across communities, campuses, or workplaces.',
  },
  {
    num: '06',
    title: 'Reassess and Improve',
    desc: 'Return periodically to retake the assessment and measure change. Seeing measurable improvement reinforces long-term behavior.',
  },
];

export function AboutScreen(props: any) {
  const { navigation } = props;
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' }}
      >
        <Text style={[TYPOGRAPHY.body, { color: COLORS.gold }]}>‹ Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 60 }}>
      <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary, marginBottom: 12 }]}>About Carbon27</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 8, lineHeight: 24 }]}>
        Empowering individuals and organizations to define and reduce their carbon impact through precise insight and ongoing measurement.
      </Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 28, lineHeight: 24 }]}>
        Carbon27 elevates sustainability into a disciplined system — where everyday decisions and operational actions translate into measurable progress.
      </Text>

      <Card style={{ marginBottom: 24, borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 8 }]}>Our Mission</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          Carbon27 exists to make carbon measurement clear, practical, and actionable. We help individuals understand their footprint and enable organizations to evaluate emissions across operations through structured assessment models.
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {pillars.map((p) => (
          <Card key={p.title} style={{ flex: 1, minWidth: '45%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginBottom: 8 }]}>{p.title}</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>{p.desc}</Text>
          </Card>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <Card style={{ flex: 1, minWidth: '45%' }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 10 }]}>Personal Impact</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22, marginBottom: 12 }]}>
            Carbon Portrait guides you through a structured personal assessment covering how you move, what you eat, how you use energy, and how you consume — turning everyday choices into a single, understandable carbon score.
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
            From there, streaks, badges, and certificates reward consistency. The goal is not perfection on day one, but a clear baseline and a path you can revisit, improve, and prove over time.
          </Text>
        </Card>
        <Card style={{ flex: 1, minWidth: '45%' }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 10 }]}>Organisational Impact</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22, marginBottom: 12 }]}>
            Organisational Impact helps teams and businesses translate operational inputs — such as energy use, headcount, and reporting period — into indicative emissions insights using transparent, documented assumptions.
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
            It is built for campuses, SMEs, and sustainability leads who need a practical starting point for dialogue, planning, and continuous improvement rather than a one-off spreadsheet.
          </Text>
        </Card>
      </View>

      <Card style={{ marginBottom: 24, borderLeftWidth: 3, borderLeftColor: COLORS.gold }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 10 }]}>How Carbon27 Works</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22, marginBottom: 12 }]}>
          You begin with measurement: either the Carbon Portrait for individuals or the Organisational Impact flow for teams. Both paths turn self-reported and operational data into scores and narratives you can act on.
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22, marginBottom: 12 }]}>
          Next, Carbon27 emphasises continuity — logging habits, revisiting the assessment, and watching how your profile changes as behaviour shifts. Progress is designed to be visible, not buried in static reports.
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          Finally, recognition and sharing matter: certificates and achievements make improvement tangible for you, your community, or your workplace, reinforcing the loop of track, reduce, sustain, and repeat.
        </Text>
      </Card>

      <Card style={{ marginBottom: 24, borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginBottom: 10 }]}>Why Carbon27</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22, marginBottom: 12 }]}>
          Many tools stop at a single number. Carbon27 treats that number as a beginning: a reference point you can improve against with structure, not guilt.
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22, marginBottom: 12 }]}>
          We combine educational framing with habit design so that sustainability feels like a system you operate — clear inputs, visible outputs, and milestones that acknowledge effort as well as outcome.
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>
          Whether you are an individual or an organisation, Carbon27 is built for the long arc: reassessment, comparison over time, and honest transparency about what is measured and what is estimated.
        </Text>
      </Card>

      <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 24, marginBottom: 12 }]}>HOW IT WORKS</Text>
      {steps.map((s) => (
        <Card key={s.num} style={{ marginBottom: 12, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <Text style={[TYPOGRAPHY.hero, { color: COLORS.gold, fontSize: 28, lineHeight: 32, minWidth: 40 }]}>{s.num}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, fontSize: 17, marginBottom: 6 }]}>{s.title}</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, lineHeight: 22 }]}>{s.desc}</Text>
          </View>
        </Card>
      ))}

      <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 0.5, borderTopColor: COLORS.border }}>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 }]}>
          Track. Reduce. Sustain. Repeat.{'\n'}Carbon27 - Sustainability Platform
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}
