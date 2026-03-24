import type { ComponentType } from 'react';
import { View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { AppHeader } from './AppHeader';

/** Wraps a screen with the shared top bar without modifying the inner screen file. */
export function withAppHeader<P extends object>(C: ComponentType<P>): ComponentType<P> {
  return function ScreenWithHeader(props: P) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
        <AppHeader />
        <C {...props} />
      </View>
    );
  };
}
