import { Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => {
        const hideHeader = route.name === 'Splash';
        return {
          animation: 'fade' as const,
          headerShown: !hideHeader,
          ...(hideHeader
            ? {}
            : {
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: COLORS.gold,
                headerLeft: navigation.canGoBack()
                  ? () => (
                      <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 8, paddingRight: 4 }}>
                        <Text style={{ color: COLORS.gold, fontSize: 22, lineHeight: 28 }}>←</Text>
                      </TouchableOpacity>
                    )
                  : undefined,
              }),
        };
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
