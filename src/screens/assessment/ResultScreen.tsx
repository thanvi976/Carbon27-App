import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, Share, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useQuizStore } from '../../store/quizStore';
import { scoreFromResponses } from '../../utils/scoring';
import { useAuthStore } from '../../store/authStore';
import { isoNow } from '../../utils/dateHelpers';
import { recordAssessment, upsertUser } from '../../services/db';
import { getBadge, getLevel } from '../../constants/levels';
import { AppHeader } from '../../components/layout/AppHeader';
import { getStackNavigator } from '../../navigation/navigateRoot';
import { useNavigation } from '@react-navigation/native';

const TIPS: string[] = [
  'Use public transportation or carpool whenever possible',
  'Reduce meat consumption and opt for plant-based meals',
  'Switch to renewable energy sources for your home',
  'Minimize single-use plastics and use reusable alternatives',
  'Support local and sustainable brands',
  'Reduce water usage with shorter showers and efficient appliances',
];

export function ResultScreen(props: any) {
  const { navigation, route } = props;
  const nav = useNavigation();
  const stackNav = getStackNavigator(nav as any);
  const { responses, resetQuiz } = useQuizStore();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const responsesSnapshot = useRef(responses).current;
  const hasFreshQuiz = Object.keys(responsesSnapshot).length > 0;

  const fromQuiz = hasFreshQuiz ? scoreFromResponses(responsesSnapshot) : null;

  const routeScore = route?.params?.score as number | undefined;
  const effectiveScore =
    typeof routeScore === 'number'
      ? routeScore
      : fromQuiz?.score ?? user?.score ?? 0;

  const level = getLevel(effectiveScore);
  const badgeLabel = getBadge(effectiveScore);

  const anim = useRef(new Animated.Value(0)).current;
  const particles = useRef(Array.from({ length: 16 }, () => new Animated.Value(0))).current;
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const id = anim.addListener(({ value }) => setDisplayScore(Math.round(value)));
    Animated.timing(anim, { toValue: effectiveScore, duration: 1500, useNativeDriver: false }).start();
    particles.forEach((p, idx) => {
      Animated.timing(p, {
        toValue: 1,
        duration: 1800,
        delay: idx * 50,
        useNativeDriver: true,
      }).start();
    });
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => {
      anim.removeListener(id);
      clearTimeout(t);
    };
  }, [anim, particles, effectiveScore]);

  useEffect(() => {
    if (!hasFreshQuiz) return;
    let mounted = true;
    (async () => {
      setSaving(true);
      setError(null);
      setOffline(false);
      try {
        if (!user) throw new Error('Not signed in');
        const { score, level: lv, badges } = scoreFromResponses(responsesSnapshot);
        const now = isoNow();
        const certId =
          user.certificateId ?? `C27-${user.uid.slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-6)}`;
        const history = [...(user.scoreHistory ?? []), { date: now, score }].slice(-40);
        const next = {
          ...user,
          score,
          level: lv,
          badges,
          responses: responsesSnapshot,
          lastAssessmentDate: now,
          certificateId: certId,
          scoreHistory: history,
        };
        setUser(next);

        await upsertUser(user.uid, {
          score,
          level: lv,
          badges,
          responses: responsesSnapshot,
          lastAssessmentDate: now,
          certificateId: certId,
          scoreHistory: history,
          streakCount: user.streakCount,
          bestStreak: user.bestStreak,
          lastCheckIn: user.lastCheckIn,
          streaks: user.streaks ?? [],
        });
        await recordAssessment({ uid: user.uid, score, level: lv, badges, responses: responsesSnapshot });
      } catch (e: any) {
        setOffline(true);
        setError(e?.message ?? 'Could not sync. Showing cached result.');
      } finally {
        if (!mounted) return;
        setSaving(false);
        resetQuiz();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hasFreshQuiz]);

  const certId =
    user?.certificateId ?? `C27-${(user?.uid ?? 'USER').slice(0, 6).toUpperCase()}-000000`;
  const userName = user?.name ?? 'Member';

  const shareSummary = async () => {
    const msg = `Carbon27 — My carbon score: ${effectiveScore}/100. Level: ${level}. Badge: ${badgeLabel}. Track yours at carbon27.ai`;
    try {
      await Share.share({ message: msg });
    } catch {
      /* user dismissed */
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <AppHeader />
      {showConfetti ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 56, bottom: 0, zIndex: 5 }}>
          {particles.map((p, i) => {
            const x = (i * 29) % 340;
            const y = (i * 47) % 620;
            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 3,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: COLORS.gold,
                  opacity: 0.65,
                  transform: [
                    {
                      translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, 80 + (i % 4) * 12] }),
                    },
                  ],
                }}
              />
            );
          })}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text style={[TYPOGRAPHY.score, { color: COLORS.gold }]}>{displayScore}</Text>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 6 }]}>{String(level).toUpperCase()}</Text>
        </View>

        {saving ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 10 }]}>Saving…</Text> : null}
        {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginTop: 10 }]}>{error}</Text> : null}
        {offline ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Offline mode.</Text> : null}

        <View style={{ height: 18 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Card style={{ flex: 1, minWidth: '28%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>CARBON SCORE</Text>
            <Text style={[TYPOGRAPHY.score, { color: COLORS.textPrimary, fontSize: 36, marginTop: 6 }]}>
              {effectiveScore}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '28%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>BADGE</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 8 }]} numberOfLines={3}>
              {badgeLabel}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: '28%' }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>LEVEL</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, marginTop: 8 }]}>{level}</Text>
          </Card>
        </View>

        <View style={{ height: 22 }} />
        <Card style={{ borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>TIPS TO IMPROVE</Text>
          <View style={{ height: 12 }} />
          {TIPS.map((t, idx) => (
            <Text key={idx} style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginBottom: idx === TIPS.length - 1 ? 0 : 10 }]}>
              {idx + 1}. {t}
            </Text>
          ))}
        </Card>

        <View style={{ height: 24 }} />
        <Button
          title="Download Certificate"
          onPress={() =>
            navigation.navigate('Certificate', {
              certId,
              name: userName,
              score: effectiveScore,
              level,
              badge: badgeLabel,
              date: isoNow(),
            } as any)
          }
        />
        <View style={{ height: 12 }} />
        <Button title="Share Results" variant="secondary" onPress={shareSummary} />
        <View style={{ height: 12 }} />
        <Button
          title="Go to Dashboard"
          variant="secondary"
          onPress={() => stackNav.navigate('Main', { screen: 'DashboardTab' } as never)}
        />
      </ScrollView>
    </View>
  );
}
