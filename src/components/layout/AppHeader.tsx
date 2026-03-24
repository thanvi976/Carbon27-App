import { useState } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

function stackNav(n: NavigationProp<ParamListBase>) {
  return n.getParent() ?? n;
}

const MENU_ITEMS: {
  label: string;
  action: (n: ReturnType<typeof stackNav>) => void;
}[] = [
  { label: 'Home', action: (n) => n.navigate('Main', { screen: 'HomeTab' } as never) },
  { label: 'Dashboard', action: (n) => n.navigate('Main', { screen: 'DashboardTab' } as never) },
  { label: 'Assessment', action: (n) => n.navigate('AssessmentStart') },
  { label: 'Streaks', action: (n) => n.navigate('Main', { screen: 'StreaksTab' } as never) },
  { label: 'Org Calculator', action: (n) => n.navigate('OrgCalculator') },
  { label: 'Profile', action: (n) => n.navigate('Main', { screen: 'ProfileTab' } as never) },
];

export function AppHeader() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [open, setOpen] = useState(false);
  const root = stackNav(navigation);

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: COLORS.bgPrimary,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.border,
        }}
      >
        <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, letterSpacing: 4 }]}>CARBON27</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          onPress={() => setOpen(true)}
          hitSlop={12}
        >
          <Text style={{ color: COLORS.textPrimary, fontSize: 22, lineHeight: 24 }}>☰</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={() => setOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              marginTop: 56,
              marginHorizontal: 16,
              backgroundColor: COLORS.bgCard,
              borderWidth: 0.5,
              borderColor: COLORS.border,
              paddingVertical: 8,
            }}
          >
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={{ paddingVertical: 14, paddingHorizontal: 16 }}
                onPress={() => {
                  setOpen(false);
                  item.action(root);
                }}
              >
                <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
