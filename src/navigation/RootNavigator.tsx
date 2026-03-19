import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { COLORS } from '../constants/colors';
import { getUser, upsertUser } from '../services/firestore';

export default function RootNavigator() {
  const { user, setUser, hydrated } = useAuthStore();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null);
          return;
        }

        // Load profile from Firestore; if missing, create a minimal record.
        let profile = await getUser(fbUser.uid);
        if (!profile) {
          profile = {
            uid: fbUser.uid,
            name: fbUser.displayName ?? 'Member',
            email: fbUser.email ?? '',
            photoURL: fbUser.photoURL ?? null,
            score: 0,
            level: 'Carbon Rookie',
            badges: [],
            responses: {},
            streakCount: 0,
            bestStreak: 0,
            lastCheckIn: null,
            lastAssessmentDate: null,
            scoreHistory: [],
            certificateId: null,
            orgId: null,
          };
          await upsertUser(fbUser.uid, profile);
        }
        setUser(profile);
      } catch {
        // Offline fallback: keep whatever is in persisted store.
      } finally {
        setBooting(false);
      }
    });
    return () => unsub();
  }, [setUser]);

  if (!hydrated || booting) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.gold} />
      </View>
    );
  }

  return user ? <TabNavigator /> : <AuthNavigator />;
}

