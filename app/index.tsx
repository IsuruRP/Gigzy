import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';

/**
 * Initial route — shows a loading indicator.
 * The root layout's useEffect immediately redirects based on auth state,
 * so this screen is only visible for a brief moment (if at all).
 */
export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
