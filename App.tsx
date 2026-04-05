import './global.css';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { OnboardingScreen } from './src/screens/auth/OnboardingScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { AssessmentStartScreen } from './src/screens/assessment/AssessmentStartScreen';
import { QuizScreen } from './src/screens/assessment/QuizScreen';
import { EmailCaptureScreen } from './src/screens/assessment/EmailCaptureScreen';
import { ResultScreen } from './src/screens/assessment/ResultScreen';
import { CertificateScreen } from './src/screens/certificate/CertificateScreen';
import { CarbonRunnerScreen } from './src/screens/game/CarbonRunnerScreen';
import { AboutScreen } from './src/screens/info/AboutScreen';
import { ContactScreen } from './src/screens/info/ContactScreen';
import { PrivacyPolicyScreen } from './src/screens/info/PrivacyPolicyScreen';
import { TermsScreen } from './src/screens/info/TermsScreen';
import { EditProfileScreen } from './src/screens/profile/EditProfileScreen';
import { withAppHeader } from './src/components/layout/withAppHeader';
import { COLORS } from './src/constants/colors';
import type { RootStackParamList } from './src/navigation/rootTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

const infoScreenOptions = ({ navigation }: { navigation: { canGoBack: () => boolean; goBack: () => void } }) => ({
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerTintColor: COLORS.gold,
  headerLeft: navigation.canGoBack()
    ? () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 8 }}>
          <Text style={{ color: COLORS.gold, fontSize: 28, lineHeight: 32 }}>‹</Text>
        </TouchableOpacity>
      )
    : undefined,
});

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
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="AssessmentStart" component={AssessmentStartWrapped} />
        <Stack.Screen name="Quiz" component={QuizWrapped} />
        <Stack.Screen name="EmailCapture" component={EmailCaptureWrapped} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Certificate" component={CertificateWrapped} />
        <Stack.Screen name="CarbonRunner" component={CarbonRunnerScreen} />
        <Stack.Screen name="About" component={AboutScreen} options={infoScreenOptions} />
        <Stack.Screen name="Contact" component={ContactScreen} options={infoScreenOptions} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={infoScreenOptions} />
        <Stack.Screen name="Terms" component={TermsScreen} options={infoScreenOptions} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
