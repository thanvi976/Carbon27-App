import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { QUESTIONS } from '../../constants/questions';
import { COLORS } from '../../constants/colors';
import { useQuizStore } from '../../store/quizStore';
import type { QuizResponses } from '../../types';
import Svg, { Path } from 'react-native-svg';

const CELEBRATION_EMOJIS = ['♻️ Smart!', '🌱 Eco Win!', '⚡ Noted!', '🌍 Planet Thanks You!', '💚 Green!'];

function getMicrocopy(pct: number) {
  if (pct < 25) return 'Every answer builds your carbon profile 🔍';
  if (pct < 50) return "You're building your carbon profile 🌱";
  if (pct < 75) return 'Halfway there — the planet thanks you 🌍';
  return 'Final stretch. Your score awaits ⚡';
}

function Checkmark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M20 6L9 17l-5-5" stroke={COLORS.gold} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function QuizScreen(props: any) {
  const { navigation } = props;
  const { currentIndex, setCurrentIndex, responses, setAnswer } = useQuizStore();
  const q = QUESTIONS[currentIndex];
  const answer = responses[q.id];
  const isLastQuestion = currentIndex >= QUESTIONS.length - 1;

  const progressPct = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const microcopy = getMicrocopy(progressPct);

  const shuffledOptions = useMemo(() => {
    if (!q?.options) return [];
    return [...q.options].sort(() => Math.random() - 0.5);
  }, [q?.id ?? q?.text]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const questionKey = useMemo(() => q.id, [q.id]);

  const translateX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
  const floatTranslateY = useRef(new Animated.Value(0)).current;
  const floatOpacity = useRef(new Animated.Value(1)).current;

  const clearAdvanceTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAdvanceTimer();
  }, [clearAdvanceTimer]);

  useEffect(() => {
    translateX.setValue(dir * 32);
    cardOpacity.setValue(0.5);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [questionKey, dir, translateX, cardOpacity]);

  const playFloatingCelebration = useCallback(() => {
    const text = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];
    setFloatingEmoji(text);
    floatTranslateY.setValue(0);
    floatOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(floatTranslateY, {
        toValue: -60,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(floatOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setFloatingEmoji(null);
    });
  }, [floatOpacity, floatTranslateY]);

  const handleAnswer = (id: keyof QuizResponses, value: number) => {
    setAnswer(id, value);
    playFloatingCelebration();
    clearAdvanceTimer();

    const idx = useQuizStore.getState().currentIndex;
    if (idx < QUESTIONS.length - 1) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const ci = useQuizStore.getState().currentIndex;
        if (ci < QUESTIONS.length - 1) {
          setDir(1);
          useQuizStore.getState().setCurrentIndex(ci + 1);
        }
      }, 650);
    }
  };

  const handlePrevious = () => {
    clearAdvanceTimer();
    if (currentIndex > 0) {
      setDir(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    clearAdvanceTimer();
    if (!answer) return;
    if (isLastQuestion) {
      navigation.navigate('EmailCapture');
      return;
    }
    setDir(1);
    setCurrentIndex(currentIndex + 1);
  };

  const prevDisabled = currentIndex === 0;
  const nextDisabled = answer === undefined;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      {floatingEmoji != null ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            zIndex: 40,
            alignItems: 'center',
            transform: [{ translateY: floatTranslateY }],
            opacity: floatOpacity,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: COLORS.gold,
            }}
          >
            {floatingEmoji}
          </Text>
        </Animated.View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 11, letterSpacing: 1, color: COLORS.textMuted, textTransform: 'uppercase' }}>
            QUESTION {String(currentIndex + 1).padStart(2, '0')} OF {QUESTIONS.length}
          </Text>
          <Text style={{ fontSize: 11, letterSpacing: 1, color: COLORS.gold, textTransform: 'uppercase' }}>
            {Math.round(progressPct)}% COMPLETE
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 3, marginBottom: 8 }}>
          {QUESTIONS.map((seg) => {
            const filled = responses[seg.id] !== undefined;
            return (
              <View
                key={seg.id}
                style={{
                  height: 2,
                  flex: 1,
                  borderRadius: 999,
                  backgroundColor: filled ? COLORS.gold : COLORS.border,
                }}
              />
            );
          })}
        </View>

        <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 20 }}>{microcopy}</Text>

        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ translateX }],
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '300',
              color: COLORS.textPrimary,
              lineHeight: 30,
              marginBottom: 20,
            }}
          >
            {q.text}
          </Text>

          <View style={{ gap: 12, marginBottom: 24 }}>
            {shuffledOptions.map((opt) => {
              const selected = answer === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleAnswer(q.id, opt.value)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                  <View
                    style={{
                      minHeight: 56,
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      borderColor: selected ? COLORS.gold : COLORS.border,
                      borderWidth: selected ? 1 : 0.5,
                      backgroundColor: selected ? 'rgba(200,184,154,0.08)' : COLORS.bgCard,
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 16, color: COLORS.textPrimary, lineHeight: 22 }}>{opt.label}</Text>
                    {selected ? <Checkmark /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ flex: 1, minHeight: 16 }} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={handlePrevious}
            disabled={prevDisabled}
            accessibilityState={{ disabled: prevDisabled }}
            style={({ pressed }) => [
              {
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                borderWidth: 0.5,
                borderColor: COLORS.gold,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: prevDisabled ? 0.3 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.gold, letterSpacing: 0.5 }}>PREV</Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            disabled={nextDisabled}
            accessibilityState={{ disabled: nextDisabled }}
            style={({ pressed }) => [
              {
                flex: 2,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: COLORS.gold,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: nextDisabled ? 0.4 : pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.bgPrimary, letterSpacing: 0.5 }}>
              {isLastQuestion ? 'REVEAL MY FOOTPRINT' : 'NEXT'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
