import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  HomeTab: undefined;
  StreaksTab: undefined;
  DashboardTab: undefined;
  OrgTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  AssessmentStart: undefined;
  Quiz: undefined;
  EmailCapture: undefined;
  Result: { score?: number } | undefined;
  Certificate:
    | {
        certId?: string;
        name?: string;
        score?: number;
        level?: string;
        badge?: string;
        date?: string;
      }
    | undefined;
  CarbonRunner: undefined;
  About: undefined;
  Contact: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  ForgotPassword: undefined;
};
