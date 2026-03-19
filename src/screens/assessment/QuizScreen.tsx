import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { QUESTIONS } from '../../constants/questions';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useQuizStore } from '../../store/quizStore';
import Svg, { Path } from 'react-native-svg';

type Props = NativeStackScreenProps<HomeStackParamList, 'Quiz'>;

function Checkmark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M20 6L9 17l-5-5" stroke={COLORS.gold} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function QuizScreen({ navigation }: Props) {
  const { currentIndex, setCurrentIndex, responses, setAnswer } = useQuizStore();
  const q = QUESTIONS[currentIndex];
  const answer = responses[q.id];
  const progress = (currentIndex + 1) / QUESTIONS.length;

  const anim = useRef(new Animated.Value(0)).current;
  const [dir, setDir] = useState<1 | -1>(1);
  const questionKey = useMemo(() => q.id, [q.id]);

  useEffect(() => {
    anim.setValue(dir * 24);
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }, [anim, questionKey, dir]);

  const next = () => {
    if (currentIndex >= QUESTIONS.length - 1) {
      navigation.navigate('EmailCapture');
      return;
    }
    setDir(1);
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <ProgressBar progress={progress} />
      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted }]} />
          <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted }]}>
            {String(currentIndex + 1).padStart(2, '0')} / {QUESTIONS.length}
          </Text>
        </View>

        <View style={{ height: 22 }} />
        <Animated.View style={{ transform: [{ translateX: anim }], opacity: anim.interpolate({ inputRange: [-24, 0, 24], outputRange: [0.6, 1, 0.6] }) }}>
          <Text style={{ fontSize: 22, fontWeight: '300', color: COLORS.textPrimary, lineHeight: 30 }}>{q.text}</Text>
        </Animated.View>

        <View style={{ height: 18 }} />
        <View style={{ gap: 12 }}>
          {q.options.map((opt) => {
            const selected = answer === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setAnswer(q.id, opt.value)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Card
                  style={{
                    borderColor: selected ? COLORS.gold : COLORS.border,
                    borderWidth: selected ? 0.8 : 0.5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary }]}>{opt.label}</Text>
                  {selected ? <Checkmark /> : null}
                </Card>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Button title="NEXT" onPress={next} disabled={!answer} />
      </View>
    </View>
  );
}

