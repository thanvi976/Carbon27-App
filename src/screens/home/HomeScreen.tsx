import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AppHeader } from '../../components/layout/AppHeader';
import { getStackNavigator } from '../../navigation/navigateRoot';

export function HomeScreen() {
  const navigation = useNavigation();
  const stackNav = getStackNavigator(navigation as any);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary }]}>Know Your Carbon Score</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 14 }]}>
          Calculate your personal carbon footprint in minutes. Get your sustainability badge and share your impact.
        </Text>

        <View style={{ height: 22 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Button title="Carbon Portrait" onPress={() => stackNav.navigate('AssessmentStart' as never)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Organisational Impact"
              variant="secondary"
              onPress={() => stackNav.navigate('Main', { screen: 'OrgTab' } as never)}
            />
          </View>
        </View>

        <View style={{ height: 36 }} />
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Why Carbon27?</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>
          Making sustainability fun and accessible
        </Text>

        <View style={{ height: 18 }} />
        <Card style={{ marginBottom: 12 }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.sage }]}>🌿 Quick Assessment</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 8 }]}>
            15 simple questions to understand your carbon footprint
          </Text>
        </Card>
        <Card style={{ marginBottom: 12 }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.sage }]}>🏅 Get Your Badge</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 8 }]}>
            Earn your sustainability badge and level up your eco-game
          </Text>
        </Card>
        <Card style={{ marginBottom: 12 }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.sage }]}>📈 Track Progress</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 8 }]}>
            Retake the assessment and see your improvement over time
          </Text>
        </Card>

        <View style={{ height: 28 }} />
        <Card style={{ borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
          <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Ready to Start Your Journey?</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 10 }]}>
            Join thousands of people tracking their carbon footprint
          </Text>
          <View style={{ height: 16 }} />
          <Button title="Unlock My Carbon Score" onPress={() => stackNav.navigate('AssessmentStart' as never)} />
        </Card>
      </ScrollView>
    </View>
  );
}
