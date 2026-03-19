import { Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useQuizStore } from '../../store/quizStore';
export function AssessmentStartScreen(props: any) {
  const { navigation } = props;
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, padding: 20, justifyContent: 'center' }}>
      <Text style={{ color: COLORS.gold, fontSize: 80, fontWeight: '200' }}>15</Text>
      <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 12 }]}>Questions</Text>
      <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 14 }]}>
        Answer honestly to generate a score, badges, and a personalized improvement plan.
      </Text>

      <View style={{ height: 22 }} />
      <Button
        title="BEGIN ASSESSMENT"
        onPress={() => {
          resetQuiz();
          navigation.navigate('Quiz');
        }}
      />
    </View>
  );
}

