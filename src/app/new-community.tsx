import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const OUTLINE = '#1B2A21';
const BAR_GREEN = '#1FC98A';

/** Simple drawing: a board with members, message bars and a megaphone. */
function Illustration() {
  const theme = useTheme();
  const bar = (color: string, icon?: React.ReactNode) => (
    <View style={[styles.bar, { backgroundColor: color }]}>
      {icon}
      <View style={styles.barLines}>
        <View style={styles.line} />
        <View style={[styles.line, styles.lineShort]} />
      </View>
    </View>
  );

  return (
    <View style={styles.art}>
      <View style={[styles.board, { backgroundColor: theme.illustrationCard }]}>
        <View style={styles.boardLeft}>
          <Icon name="communitiesFill" size={44} color={BAR_GREEN} />
        </View>
        <View style={styles.boardRight}>
          {bar('#FFFFFF', <Icon name="edit" size={22} color="#8BD34A" />)}
          {bar(BAR_GREEN)}
          {bar(BAR_GREEN, <Icon name="star" size={20} color="#FFFFFF" />)}
        </View>
      </View>
      <View style={styles.megaphone}>
        <Icon name="megaphoneFill" size={64} color="#25D366" />
      </View>
    </View>
  );
}

/** Sheet from the Communities "+" button. */
export default function NewCommunitySheet() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.four }]}>
      <View style={styles.close}>
        <GlassIconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />
      </View>

      <Illustration />

      <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
        Create a new community
      </Text>
      <Text style={[styles.body, { color: theme.text }]}>
        Bring together a neighbourhood, school or more. Create topic-based groups for members, and
        easily send them admin announcements.
      </Text>

      <Pressable accessibilityRole="link" hitSlop={8}>
        <Text style={[styles.link, { color: theme.accent }]}>See example communities</Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Get started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
  },
  close: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    zIndex: 1,
  },
  art: {
    width: 300,
    height: 190,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  board: {
    width: 250,
    height: 170,
    borderRadius: Radius.medium + 2,
    borderWidth: 2,
    borderColor: OUTLINE,
    flexDirection: 'row',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  boardLeft: {
    width: 64,
  },
  boardRight: {
    flex: 1,
    gap: Spacing.two,
    justifyContent: 'center',
  },
  bar: {
    height: 38,
    borderRadius: Radius.small,
    borderWidth: 2,
    borderColor: OUTLINE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  barLines: {
    flex: 1,
    gap: 5,
    alignItems: 'flex-end',
  },
  line: {
    height: 2,
    width: '80%',
    backgroundColor: OUTLINE,
    borderRadius: 1,
  },
  lineShort: {
    width: '60%',
  },
  megaphone: {
    position: 'absolute',
    left: 0,
    bottom: 10,
    transform: [{ rotate: '-20deg' }],
  },
  title: {
    marginTop: Spacing.eight,
    fontSize: FontSize.largeTitle - 2,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 42,
  },
  body: {
    marginTop: Spacing.four,
    fontSize: FontSize.body - 1,
    lineHeight: 24,
    textAlign: 'center',
  },
  link: {
    marginTop: Spacing.four,
    fontSize: FontSize.body - 1,
    fontWeight: '600',
  },
  button: {
    alignSelf: 'stretch',
    height: 54,
    marginTop: Spacing.five,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.body + 1,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
