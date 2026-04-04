import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OrgStackParamList } from './types';
import { OrgDashboardScreen } from '../screens/org/OrgDashboardScreen';
import { CreateOrgScreen } from '../screens/org/CreateOrgScreen';
import { JoinOrgScreen } from '../screens/org/JoinOrgScreen';
import { OrgImpactScreen } from '../screens/org/OrgImpactScreen';

const Stack = createNativeStackNavigator<OrgStackParamList>();

export function OrgStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="OrgDashboard" component={OrgDashboardScreen} />
      <Stack.Screen name="CreateOrg" component={CreateOrgScreen} />
      <Stack.Screen name="JoinOrg" component={JoinOrgScreen} />
      <Stack.Screen name="OrgImpact" component={OrgImpactScreen} />
    </Stack.Navigator>
  );
}

