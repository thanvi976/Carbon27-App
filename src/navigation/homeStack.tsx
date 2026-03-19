import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AssessmentStartScreen } from '../screens/assessment/AssessmentStartScreen';
import { QuizScreen } from '../screens/assessment/QuizScreen';
import { EmailCaptureScreen } from '../screens/assessment/EmailCaptureScreen';
import { ResultScreen } from '../screens/assessment/ResultScreen';
import { CertificateScreen } from '../screens/certificate/CertificateScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AssessmentStart" component={AssessmentStartScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="EmailCapture" component={EmailCaptureScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Certificate" component={CertificateScreen} />
    </Stack.Navigator>
  );
}

