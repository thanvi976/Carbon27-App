import { Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OrgStackParamList } from './types';
import { OrgDashboardScreen } from '../screens/org/OrgDashboardScreen';
import { CreateOrgScreen } from '../screens/org/CreateOrgScreen';
import { JoinOrgScreen } from '../screens/org/JoinOrgScreen';
import { OrgImpactScreen } from '../screens/org/OrgImpactScreen';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator<OrgStackParamList>();

export function OrgStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => {
        const hideHeader = route.name === 'OrgDashboard';
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
                      <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 8 }}>
                        <Text style={{ color: COLORS.gold, fontSize: 28, lineHeight: 32 }}>‹</Text>
                      </TouchableOpacity>
                    )
                  : undefined,
              }),
        };
      }}
    >
      <Stack.Screen name="OrgDashboard" component={OrgDashboardScreen} />
      <Stack.Screen name="CreateOrg" component={CreateOrgScreen} />
      <Stack.Screen name="JoinOrg" component={JoinOrgScreen} />
      <Stack.Screen name="OrgImpact" component={OrgImpactScreen} />
    </Stack.Navigator>
  );
}
