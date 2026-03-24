import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Animated,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuthStore } from '../../store/authStore';
import type { UserStreak } from '../../types';
import {
  calendarDaysBetween,
  formatCertificateDate,
  isoNow,
  isSameCalendarDay,
  isYesterdayCalendar,
} from '../../utils/dateHelpers';
import { normalizeCarbonUser } from '../../utils/userHelpers';
import { upsertUser } from '../../services/firestore';

const MILESTONES = new Set([10, 25, 50, 100]);

function flameString(n: number): string {
  if (n <= 0) return '';
  if (n < 7) return '🔥';
  if (n < 30) return '🔥🔥';
  if (n < 100) return '🔥🔥🔥';
  return '🔥🔥🔥🔥';
}

function staleResetNeeded(lastLoggedDate: string | null, nowIso: string): boolean {
  if (!lastLoggedDate) return false;
  return calendarDaysBetween(lastLoggedDate, nowIso) > 1;
}

export function StreaksScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const u = user ? normalizeCarbonUser(user) : null;
  const streaks = u?.streaks ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particles = useRef(Array.from({ length: 18 }, () => new Animated.Value(0))).current;

  useFocusEffect(
    useCallback(() => {
      const state = useAuthStore.getState();
      const raw = state.user;
      if (!raw) return;
      const nu = normalizeCarbonUser(raw);
      const list = nu.streaks ?? [];
      const now = isoNow();
      let changed = false;
      const next = list.map((s) => {
        if (staleResetNeeded(s.lastLoggedDate, now) && s.currentStreak !== 0) {
          changed = true;
          return { ...s, currentStreak: 0 };
        }
        return s;
      });
      if (changed) {
        state.updateUser((prev) => ({ ...prev, streaks: next }));
        upsertUser(nu.uid, { streaks: next }).catch(() => {});
      }
    }, [])
  );

  const playConfetti = () => {
    if (confettiTimer.current) clearTimeout(confettiTimer.current);
    setShowConfetti(true);
    particles.forEach((p, idx) => {
      p.setValue(0);
      Animated.timing(p, {
        toValue: 1,
        duration: 1600,
        delay: idx * 40,
        useNativeDriver: true,
      }).start();
    });
    confettiTimer.current = setTimeout(() => setShowConfetti(false), 3000);
  };

  const persistStreaks = (next: UserStreak[]) => {
    if (!u) return;
    updateUser((prev) => ({ ...prev, streaks: next }));
    upsertUser(u.uid, { streaks: next }).catch(() => {});
  };

  const addActivity = () => {
    const label = newActivity.trim();
    if (!label || !u) return;
    const row: UserStreak = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      activityName: label,
      currentStreak: 0,
      longestStreak: 0,
      lastLoggedDate: null,
    };
    persistStreaks([...streaks, row]);
    setNewActivity('');
    setModalOpen(false);
  };

  const logActivity = (row: UserStreak) => {
    if (!u) return;
    const today = new Date();
    if (row.lastLoggedDate && isSameCalendarDay(row.lastLoggedDate, today)) return;

    let nextCurrent: number;
    if (!row.lastLoggedDate) {
      nextCurrent = 1;
    } else if (isYesterdayCalendar(row.lastLoggedDate, today)) {
      nextCurrent = row.currentStreak + 1;
    } else {
      nextCurrent = 1;
    }

    const nextLong = Math.max(row.longestStreak, nextCurrent);
    const hitMilestone = MILESTONES.has(nextCurrent);

    const nextRows = streaks.map((s) =>
      s.id === row.id
        ? {
            ...s,
            currentStreak: nextCurrent,
            longestStreak: nextLong,
            lastLoggedDate: isoNow(),
          }
        : s
    );
    persistStreaks(nextRows);
    if (hitMilestone) playConfetti();
  };

  const sorted = useMemo(() => [...streaks], [streaks]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <AppHeader />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 }}>
        <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>Streaks</Text>
        <TouchableOpacity onPress={() => setModalOpen(true)}>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.sage }]}>New Activity</Text>
        </TouchableOpacity>
      </View>

      {showConfetti ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, top: 80, bottom: 0, zIndex: 20 }}
        >
          {particles.map((p, i) => {
            const left = (i * 41) % 320;
            const top = (i * 71) % 500;
            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i % 2 === 0 ? COLORS.gold : COLORS.sage,
                  opacity: 0.85,
                  transform: [
                    {
                      translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, 120 + (i % 5) * 20] }),
                    },
                    {
                      translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, (i % 3) * 30 - 30] }),
                    },
                  ],
                }}
              />
            );
          })}
        </View>
      ) : null}

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 }}
          activeOpacity={1}
          onPress={() => setModalOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Card>
              <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginBottom: 10 }]}>NEW ACTIVITY</Text>
              <TextInput
                value={newActivity}
                onChangeText={setNewActivity}
                placeholder="Activity name"
                placeholderTextColor={COLORS.textMuted}
                style={[
                  TYPOGRAPHY.body,
                  {
                    color: COLORS.textPrimary,
                    backgroundColor: COLORS.bgSecondary,
                    borderBottomWidth: 0.5,
                    borderBottomColor: COLORS.border,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  },
                ]}
              />
              <View style={{ height: 16 }} />
              <Button title="Confirm" onPress={addActivity} />
            </Card>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 32 }}>
        {sorted.length === 0 ? (
          <Card>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>No activities yet.</Text>
            <View style={{ height: 14 }} />
            <Button title="Create Activity" onPress={() => setModalOpen(true)} />
          </Card>
        ) : (
          sorted.map((s) => {
            const loggedToday = s.lastLoggedDate ? isSameCalendarDay(s.lastLoggedDate) : false;
            const flames = flameString(s.currentStreak);
            const lastLabel = s.lastLoggedDate ? formatCertificateDate(s.lastLoggedDate) : 'Never';
            return (
              <Card key={s.id} style={{ marginBottom: 14 }}>
                <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary }]}>{s.activityName}</Text>
                {flames ? (
                  <Text style={{ fontSize: 20, marginTop: 6 }}>{flames}</Text>
                ) : null}
                <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 8 }]}>
                  Current streak: {s.currentStreak}
                </Text>
                <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginTop: 4 }]}>
                  Longest streak: {s.longestStreak}
                </Text>
                <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 4 }]}>Last logged: {lastLabel}</Text>
                <View style={{ height: 12 }} />
                <Button
                  title={loggedToday ? 'Already Logged Today' : 'Log Activity'}
                  onPress={() => logActivity(s)}
                  disabled={loggedToday}
                />
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
