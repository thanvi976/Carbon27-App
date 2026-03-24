import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { COLORS } from '../constants/colors';

export default function RootNavigator() {
  const { user, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.gold} />
      </View>
    );
  }

  return user ? <TabNavigator /> : <AuthNavigator />;
}