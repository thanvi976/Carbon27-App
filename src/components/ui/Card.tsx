import { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.bgCard,
          borderColor: COLORS.border,
          borderWidth: 0.5,
          borderRadius: 2,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

