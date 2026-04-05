export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: { step?: 'profile'; googleName?: string } | undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  AssessmentStart: undefined;
  Quiz: undefined;
  EmailCapture: undefined;
  Result: undefined;
  Certificate: { certId: string; name: string; score: number; level: string; date: string } | undefined;
};

export type StreaksStackParamList = {
  Streaks: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type OrgStackParamList = {
  OrgDashboard: undefined;
  CreateOrg: undefined;
  JoinOrg: undefined;
  OrgImpact: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  StreaksTab: undefined;
  OrgTab: undefined;
  ProfileTab: undefined;
};

