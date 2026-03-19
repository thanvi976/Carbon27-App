import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Share, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useQuizStore } from '../../store/quizStore';
import { scoreFromResponses, improvementTips } from '../../utils/scoring';
import { useAuthStore } from '../../store/authStore';
import { isoNow, formatDateShort } from '../../utils/dateHelpers';
import { recordAssessment, upsertUser } from '../../services/firestore';
import { linkedInShareText } from '../../utils/shareText';
import { useStreakStore } from '../../store/streakStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'Result'>;

export function ResultScreen({ navigation }: Props) {
  const { responses, resetQuiz } = useQuizStore();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const checkIn = useStreakStore((s) => s.checkIn);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [saving, setSaving] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);

  const { score, level, badges } = useMemo(() => scoreFromResponses(responses), [responses]);
  const tips = useMemo(() => improvementTips(responses), [responses]);

  const anim = useRef(new Animated.Value(0)).current;
  const particles = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const id = anim.addListener(({ value }) => setDisplayScore(Math.round(value)));
    Animated.timing(anim, { toValue: score, duration: 1500, useNativeDriver: false }).start();
    particles.forEach((p, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(200 * idx),
          Animated.timing(p, { toValue: 1, duration: 2200, useNativeDriver: true }),
          Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
    return () => {
      anim.removeListener(id);
    };
  }, [anim, particles, score]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setSaving(true);
      setError(null);
      setOffline(false);
      try {
        checkIn(); // streak increments on assessment complete
        if (!user) throw new Error('Not signed in');
        const now = isoNow();
        const certId = user.certificateId ?? `C27-${user.uid.slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-6)}`;
        const history = [...(user.scoreHistory ?? []), { date: now, score }].slice(-40);
        const next = {
          ...user,
          score,
          level,
          badges,
          responses,
          lastAssessmentDate: now,
          certificateId: certId,
          scoreHistory: history,
        };
        setUser(next);

        await upsertUser(user.uid, {
          score,
          level,
          badges,
          responses,
          lastAssessmentDate: now,
          certificateId: certId,
          scoreHistory: history,
          streakCount: user.streakCount,
          bestStreak: user.bestStreak,
          lastCheckIn: user.lastCheckIn,
        });
        await recordAssessment({ uid: user.uid, score, level, badges, responses });
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
  }, [badges, checkIn, level, resetQuiz, responses, score, setUser, user]);

  const certId = user?.certificateId ?? `C27-${(user?.uid ?? 'USER').slice(0, 6).toUpperCase()}-000000`;
  const date = formatDateShort(user?.lastAssessmentDate ?? isoNow());

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary, padding: 20 }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        {particles.map((p, i) => {
          const x = (i * 27) % 320;
          const y = (i * 53) % 680;
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 2,
                height: 2,
                borderRadius: 999,
                backgroundColor: COLORS.gold,
                opacity: 0.6,
                transform: [
                  {
                    translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }),
                  },
                ],
              }}
            />
          );
        })}
      </View>

      <View style={{ alignItems: 'center', marginTop: 26 }}>
        <Text style={[TYPOGRAPHY.score, { color: COLORS.gold }]}>{displayScore}</Text>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 6 }]}>{String(level).toUpperCase()}</Text>
      </View>

      {saving ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 10 }]}>Saving…</Text> : null}
      {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginTop: 10 }]}>{error}</Text> : null}
      {offline ? <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 6 }]}>Offline mode.</Text> : null}

      <View style={{ height: 18 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {badges.map((b) => (
          <Badge key={b} label={b.replace(/_/g, ' ')} tone="gold" />
        ))}
        {badges.length === 0 ? <Badge label="no badges yet" /> : null}
      </View>

      <View style={{ height: 18 }} />
      <Card style={{ borderLeftWidth: 3, borderLeftColor: COLORS.sage }}>
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage }]}>TOP IMPROVEMENTS</Text>
        <View style={{ height: 10 }} />
        {tips.map((t, idx) => (
          <Text key={idx} style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, marginBottom: idx === 2 ? 0 : 10 }]}>
            {t}
          </Text>
        ))}
      </Card>

      <View style={{ flex: 1 }} />
      <Button
        title="DOWNLOAD CERTIFICATE"
        onPress={() =>
          navigation.navigate('Certificate', {
            certId,
            name: user?.name ?? 'Member',
            score,
            level,
            date,
          } as any)
        }
      />
      <View style={{ height: 12 }} />
      <Button
        title="Share on LinkedIn"
        variant="secondary"
        onPress={async () => {
          try {
            await Share.share({ message: linkedInShareText(score, level) });
          } catch {}
        }}
      />
    </View>
  );
}

