import { useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import Svg, { Path, Circle } from 'react-native-svg';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

function SlideArt({ kind }: { kind: 1 | 2 | 3 }) {
  if (kind === 1) {
    return (
      <Svg width={180} height={180} viewBox="0 0 200 200">
        <Path d="M60 140c60-10 90-50 90-90-40 10-80 40-90 90z" fill="none" stroke={COLORS.gold} strokeWidth={2} />
        <Path d="M65 135c30-30 55-50 85-70" fill="none" stroke={COLORS.sage} strokeWidth={1} />
      </Svg>
    );
  }
  if (kind === 2) {
    return (
      <Svg width={180} height={180} viewBox="0 0 200 200">
        <Path d="M30 150h140" stroke={COLORS.surface} strokeWidth={2} />
        <Path d="M40 140l35-40 30 18 45-65" fill="none" stroke={COLORS.gold} strokeWidth={2} />
        <Circle cx="40" cy="140" r="4" fill={COLORS.gold} />
        <Circle cx="75" cy="100" r="4" fill={COLORS.gold} />
        <Circle cx="105" cy="118" r="4" fill={COLORS.gold} />
        <Circle cx="150" cy="53" r="4" fill={COLORS.gold} />
      </Svg>
    );
  }
  return (
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="70" fill="none" stroke={COLORS.gold} strokeWidth={2} />
      <Circle cx="100" cy="100" r="40" fill="none" stroke={COLORS.sage} strokeWidth={1} />
    </Svg>
  );
}

export function OnboardingScreen({ navigation }: Props) {
  const slides = useMemo(
    () => [
      { num: '01', title: 'Know Your Impact', kind: 1 as const },
      { num: '02', title: 'Track Your Journey', kind: 2 as const },
      { num: '03', title: 'Live Sustainably', kind: 3 as const },
    ],
    []
  );

  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        keyExtractor={(s) => s.num}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: 20, paddingTop: 90 }}>
            <Text style={{ color: COLORS.gold, fontSize: 80, fontWeight: '200' }}>{item.num}</Text>
            <Text style={[TYPOGRAPHY.section, { color: COLORS.textPrimary, marginTop: 10 }]}>{item.title}</Text>
            <View style={{ marginTop: 36, alignItems: 'center' }}>
              <SlideArt kind={item.kind} />
            </View>
          </View>
        )}
      />

      <View style={{ position: 'absolute', bottom: 92, left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: i === index ? COLORS.gold : COLORS.surface,
              }}
            />
          ))}
        </View>
      </View>

      {index === 2 ? (
        <View style={{ position: 'absolute', left: 20, right: 20, bottom: 28 }}>
          <Button title="BEGIN" onPress={() => navigation.replace('Login')} />
        </View>
      ) : null}
    </View>
  );
}

