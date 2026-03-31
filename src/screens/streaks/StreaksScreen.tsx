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
  formatCertificateDate,
  isoNow,
} from '../../utils/dateHelpers';
import { getStreaks, updateStreak, insertStreak, deleteStreak, renameStreak } from '../../services/db';

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
  const nowStr = new Date(nowIso).toLocaleDateString('en-CA');
  const lastStr = new Date(lastLoggedDate).toLocaleDateString('en-CA');
  const [y1, m1, d1] = nowStr.split('-').map(Number);
  const [y2, m2, d2] = lastStr.split('-').map(Number);
  const diffDays = Math.floor(
    (new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return diffDays > 1;
}

export function StreaksScreen() {
  const user = useAuthStore((s) => s.user);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [actionTarget, setActionTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [renameTarget, setRenameTarget] = useState<any | null>(null);
  const [renameText, setRenameText] = useState('');
  const [saving, setSaving] = useState(false);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particles = useRef(Array.from({ length: 18 }, () => new Animated.Value(0))).current;

  const refetchStreaks = useCallback(async (uid: string) => {
    const rows = await getStreaks(uid);
    setStreaks(
      rows.map((r: any) => ({
        id: r.id ?? `${r.user_id}-${r.activity_name}`,
        activityName: r.activity_name,
        currentStreak: r.current_streak,
        longestStreak: r.longest_streak,
        lastLoggedDate: r.last_logged_date,
      }))
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      let mounted = true;
      (async () => {
        setLoading(true);
        const rows = await getStreaks(user.uid);
        const now = isoNow();
        for (const r of rows) {
          if (staleResetNeeded(r.last_logged_date, now) && r.current_streak !== 0) {
            await updateStreak(r.id, {
              current_streak: 0,
              longest_streak: r.longest_streak,
              last_logged_date: r.last_logged_date,
            });
          }
        }
        if (mounted) {
          await refetchStreaks(user.uid);
          setLoading(false);
        }
      })().catch(() => {
        if (mounted) setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, [refetchStreaks, user?.uid])
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

  const addActivity = async () => {
    const label = newActivity.trim();
    if (!label || !user?.uid) return;
    await insertStreak(user.uid, label);
    await refetchStreaks(user.uid);
    setNewActivity('');
    setModalOpen(false);
  };

  const logActivity = async (row: UserStreak) => {
  if (!user?.uid) return;

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  // Check if already logged today — same logic as website
  if (row.lastLoggedDate) {
    const lastStr = new Date(row.lastLoggedDate).toLocaleDateString('en-CA');
    if (lastStr === today) return; // already logged today, do nothing
  }

  let nextCurrent: number;

  if (!row.lastLoggedDate) {
    // First time logging
    nextCurrent = 1;
  } else {
    const lastStr = new Date(row.lastLoggedDate).toLocaleDateString('en-CA');
    const [y1, m1, d1] = today.split('-').map(Number);
    const [y2, m2, d2] = lastStr.split('-').map(Number);
    const diffDays = Math.floor(
      (new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Yesterday — continue streak
      nextCurrent = row.currentStreak + 1;
    } else {
      // More than 1 day gap — reset
      nextCurrent = 1;
    }
  }

  const nextLong = Math.max(row.longestStreak, nextCurrent);
  const hitMilestone = MILESTONES.has(nextCurrent);

  await updateStreak(row.id, {
    current_streak: nextCurrent,
    longest_streak: nextLong,
    last_logged_date: today,
  });
  await refetchStreaks(user.uid);
  if (hitMilestone) playConfetti();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !user?.uid) return;
    await deleteStreak(user.uid, deleteTarget.activityName);
    await refetchStreaks(user.uid);
    setDeleteTarget(null);
  };

  const handleRenameConfirm = async () => {
    if (!renameTarget || !renameText.trim() || !user?.uid) return;
    setSaving(true);
    await renameStreak(renameTarget.id, renameText.trim());
    await refetchStreaks(user.uid);
    setSaving(false);
    setRenameTarget(null);
    setRenameText('');
  };

  const handleThreeDots = (s: any) => {
    setActionTarget(s);
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
            const loggedToday = s.lastLoggedDate
              ? new Date(s.lastLoggedDate).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA')
              : false;
            const flames = flameString(s.currentStreak);
            const lastLabel = s.lastLoggedDate ? formatCertificateDate(s.lastLoggedDate) : 'Never';
            return (
              <Card key={s.id} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, flex: 1 }]}>{s.activityName}</Text>
                  <TouchableOpacity
                    onPress={() => handleThreeDots(s)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ color: COLORS.textMuted, fontSize: 18, letterSpacing: 2 }}>⋯</Text>
                  </TouchableOpacity>
                </View>
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

      <Modal visible={!!actionTarget} transparent animationType="slide" onRequestClose={() => setActionTarget(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setActionTarget(null)} />
          <View
            style={{
              backgroundColor: COLORS.bgSecondary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 0.5,
              borderLeftWidth: 0.5,
              borderRightWidth: 0.5,
              borderColor: 'rgba(255,255,255,0.08)',
              paddingBottom: 32,
              paddingTop: 16,
              paddingHorizontal: 24,
            }}
          >
            <View style={{ width: 36, height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />
            <Text style={{ fontSize: 18, color: COLORS.textPrimary, marginBottom: 4 }}>
              {actionTarget?.activityName}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: 24 }}>
              SELECT AN ACTION
            </Text>
            <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />

            <TouchableOpacity
              onPress={() => {
                setRenameTarget(actionTarget);
                setRenameText(actionTarget?.activityName ?? '');
                setActionTarget(null);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)' }}
            >
              <Text style={{ fontSize: 18, marginRight: 14 }}>✏️</Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary }]}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setDeleteTarget(actionTarget);
                setActionTarget(null);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)' }}
            >
              <Text style={{ fontSize: 18, marginRight: 14 }}>🗑️</Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActionTarget(null)} style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 }}
          activeOpacity={1}
          onPress={() => setDeleteTarget(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Card>
              <Text style={[TYPOGRAPHY.label, { color: COLORS.error, marginBottom: 8 }]}>DELETE ACTIVITY</Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginBottom: 20 }]}>
                Delete "{deleteTarget?.activityName}"? This removes all its streak history and cannot be undone.
              </Text>
              <Button title="DELETE" onPress={handleDeleteConfirm} />
              <View style={{ height: 10 }} />
              <Button title="Cancel" variant="secondary" onPress={() => setDeleteTarget(null)} />
            </Card>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!renameTarget} transparent animationType="fade" onRequestClose={() => setRenameTarget(null)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 }}
          activeOpacity={1}
          onPress={() => setRenameTarget(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Card>
              <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginBottom: 10 }]}>RENAME ACTIVITY</Text>
              <TextInput
                value={renameText}
                onChangeText={setRenameText}
                autoFocus
                placeholder="New activity name"
                placeholderTextColor={COLORS.textMuted}
                style={[
                  TYPOGRAPHY.body,
                  {
                    color: COLORS.textPrimary,
                    backgroundColor: COLORS.bgSecondary,
                    borderBottomWidth: 0.5,
                    borderBottomColor: COLORS.gold,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    marginBottom: 16,
                  },
                ]}
              />
              <Button title={saving ? 'SAVING...' : 'SAVE'} onPress={handleRenameConfirm} disabled={saving} />
              <View style={{ height: 10 }} />
              <Button title="Cancel" variant="secondary" onPress={() => setRenameTarget(null)} />
            </Card>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
