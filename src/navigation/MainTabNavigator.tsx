import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { StreaksScreen } from '../screens/streaks/StreaksScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { OrgStackNavigator } from './orgStack';
import { COLORS } from '../constants/colors';
import type { MainTabParamList } from './rootTypes';
import Svg, { Path } from 'react-native-svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, color }: { name: 'home' | 'grid' | 'flame' | 'user' | 'org'; color: string }) {
  const p =
    name === 'home'
      ? 'M12 3l9 8h-3v10h-5V15H11v6H6V11H3z'
      : name === 'grid'
        ? 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z'
        : name === 'flame'
          ? 'M12 3c2 3 4 5 4 8a4 4 0 1 1-8 0c0-2 1-4 2-6 0 2 2 3 2 5 1-1 1-3 0-7z'
          : name === 'user'
            ? 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z'
            : 'M4 4h16v4H4zm0 6h16v10H4z';
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d={p} fill={color} />
    </Svg>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.bgSecondary, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.sage,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
      />
      <Tab.Screen
        name="StreaksTab"
        component={StreaksScreen}
        options={{ tabBarLabel: 'Streaks', tabBarIcon: ({ color }) => <TabIcon name="flame" color={color} /> }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color }) => <TabIcon name="grid" color={color} /> }}
      />
      <Tab.Screen
        name="OrgTab"
        component={OrgStackNavigator}
        options={{ tabBarLabel: 'Org', tabBarIcon: ({ color }) => <TabIcon name="org" color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <TabIcon name="user" color={color} /> }}
      />
    </Tab.Navigator>
  );
}
