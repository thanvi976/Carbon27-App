import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { OnboardingScreen } from './src/screens/auth/OnboardingScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { AssessmentStartScreen } from './src/screens/assessment/AssessmentStartScreen';
import { QuizScreen } from './src/screens/assessment/QuizScreen';
import { EmailCaptureScreen } from './src/screens/assessment/EmailCaptureScreen';
import { ResultScreen } from './src/screens/assessment/ResultScreen';
import { CertificateScreen } from './src/screens/certificate/CertificateScreen';
import { CarbonRunnerScreen } from './src/screens/game/CarbonRunnerScreen';
import { withAppHeader } from './src/components/layout/withAppHeader';
import type { RootStackParamList } from './src/navigation/rootTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AssessmentStartWrapped = withAppHeader(AssessmentStartScreen);
const QuizWrapped = withAppHeader(QuizScreen);
const EmailCaptureWrapped = withAppHeader(EmailCaptureScreen);
const CertificateWrapped = withAppHeader(CertificateScreen);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="AssessmentStart" component={AssessmentStartWrapped} />
        <Stack.Screen name="Quiz" component={QuizWrapped} />
        <Stack.Screen name="EmailCapture" component={EmailCaptureWrapped} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Certificate" component={CertificateWrapped} />
        <Stack.Screen name="CarbonRunner" component={CarbonRunnerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
