import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommunityGroupRow, CommunityIcon } from '@/components/community/community-group-row';
import { GlassIconButton } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import {
  getCommunity,
  getCommunityGroups,
  useCommunityData,
  type CommunityGroup,
} from '@/data/communities';
import { useTheme } from '@/hooks/use-theme';

const COMMUNITY_ICON_SIZE = 58;
const ADD_BUTTON_HEIGHT = 54;

/** A community's page ("See all"): grey header, its groups, and an Add group button. */
export default function CommunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useCommunityData();

  const community = getCommunity(id);
  if (!community) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Community not found</Text>
      </View>
    );
  }

  const groups = getCommunityGroups(community.id);
  const joined = groups.filter((group) => group.joined);
  const available = groups.filter((group) => !group.joined);
  const openGroup = (groupId: string) =>
    router.push({ pathname: '/community-chat/[id]', params: { id: groupId } });

  const section = (title: string, list: CommunityGroup[]) =>
    list.length > 0 && (
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{title}</Text>
        {list.map((group, index) => (
          <CommunityGroupRow
            key={group.id}
            group={group}
            variant="community"
            last={index === list.length - 1}
            onPress={() => openGroup(group.id)}
          />
        ))}
      </View>
    );

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.communityHeader, paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <GlassIconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
          <GlassIconButton icon="more" accessibilityLabel="Community options" />
        </View>
        <View style={styles.identity}>
          <CommunityIcon community={community} size={COMMUNITY_ICON_SIZE} />
          <View style={styles.flex}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {community.name}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              Community · {groups.length} {groups.length === 1 ? 'group' : 'groups'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.content}>
        {section('Your groups', joined)}
        {section('Groups you can join', available)}

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Other groups added to the community will appear here. Community members can join these
          groups.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.two }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.addButton, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addText}>Add group</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingBottom: Spacing.five,
  },
  topBar: {
    height: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
  },
  name: {
    fontSize: FontSize.title + 4,
    fontWeight: '700',
  },
  meta: {
    fontSize: FontSize.subhead + 1,
    marginTop: Spacing.one,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
    paddingHorizontal: Spacing.four,
  },
  note: {
    marginTop: 'auto',
    paddingTop: Spacing.eight * 2,
    paddingHorizontal: Spacing.six,
    fontSize: FontSize.footnote,
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
  },
  addButton: {
    height: ADD_BUTTON_HEIGHT,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: FontSize.body + 1,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
