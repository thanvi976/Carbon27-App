import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { OnboardingScreen } from './src/screens/auth/OnboardingScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { AssessmentStartScreen } from './src/screens/assessment/AssessmentStartScreen';
import { QuizScreen } from './src/screens/assessment/QuizScreen';
import { EmailCaptureScreen } from './src/screens/assessment/EmailCaptureScreen';
import { ResultScreen } from './src/screens/assessment/ResultScreen';
import { CertificateScreen } from './src/screens/certificate/CertificateScreen';
import { StreaksScreen } from './src/screens/streaks/StreaksScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AssessmentStart" component={AssessmentStartScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="EmailCapture" component={EmailCaptureScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Certificate" component={CertificateScreen} />
        <Stack.Screen name="Streaks" component={StreaksScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}