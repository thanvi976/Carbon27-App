import type { NavigationProp, ParamListBase } from '@react-navigation/native';

/** Tab/leaf screens: parent stack navigator for modal flows (assessment, org, etc.). */
export function getStackNavigator(n: NavigationProp<ParamListBase>) {
  return n.getParent() ?? n;
}
