import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useStreakStore } from '../../store/streakStore';

export function SplashScreen(props: any) {
  const { navigation } = props;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkIn = useStreakStore((s) => s.checkIn);

  useEffect(() => {
    checkIn(); // streak increments on app open
    Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    const t = setTimeout(() => navigation.replace('Onboarding'), 2500);
    return () => clearTimeout(t);
  }, [checkIn, navigation, opacity]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ opacity, alignItems: 'center' }}>
        <Text style={[{ color: COLORS.textPrimary, letterSpacing: 8, fontSize: 28, fontWeight: '300' }]}>
          CARBON27
        </Text>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginTop: 10 }]}>TRACK YOUR IMPACT</Text>
      </Animated.View>
    </View>
  );
}

