import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommunityGroupRow } from '@/components/community/community-group-row';
import { GlassIconButton } from '@/components/glass-surface';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { getCommunities, getCommunityGroups, useCommunityData } from '@/data/communities';
import { useTheme } from '@/hooks/use-theme';

/** WhatsApp lists Announcements plus a couple of joined groups; the rest sit behind "See all". */
const GROUPS_PER_COMMUNITY = 3;

export default function CommunitiesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useCommunityData();

  const openGroup = (groupId: string) =>
    router.push({ pathname: '/community-chat/[id]', params: { id: groupId } });

  return (
    // Same layout as the Chats tab: the safe area sits on the outer view and the
    // list adjusts itself for the tab bar, so the top is never padded twice.
    <View style={[styles.flex, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <GlassIconButton
          icon="plus"
          accessibilityLabel="New community"
          prominent
          onPress={() => router.push('/new-community')}
        />
      </View>

      <ScrollView
        style={styles.flex}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}>
        <Text style={[styles.largeTitle, { color: theme.text }]} accessibilityRole="header">
          Communities
        </Text>

        {getCommunities().map((community) => {
          const groups = getCommunityGroups(community.id)
            .filter((group) => group.joined)
            .slice(0, GROUPS_PER_COMMUNITY);
          return (
            <View key={community.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]} numberOfLines={1}>
                  {community.name}
                </Text>
                <Pressable
                  onPress={() => router.push({ pathname: '/community/[id]', params: { id: community.id } })}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.seeAll,
                    { backgroundColor: theme.backgroundElement },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.seeAllText, { color: theme.text }]}>See all</Text>
                </Pressable>
              </View>

              {groups.map((group, index) => (
                <CommunityGroupRow
                  key={group.id}
                  group={group}
                  last={index === groups.length - 1}
                  onPress={() => openGroup(group.id)}
                />
              ))}
              <View style={[styles.sectionDivider, { backgroundColor: theme.separator }]} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.eight,
  },
  topBar: {
    height: Layout.topBarHeight,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  largeTitle: {
    fontSize: FontSize.largeTitle,
    fontWeight: '700',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.one,
    gap: Spacing.three,
  },
  sectionTitle: {
    flex: 1,
    fontSize: FontSize.title + 2,
    fontWeight: '700',
  },
  seeAll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  seeAllText: {
    fontSize: FontSize.subhead,
    fontWeight: '600',
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
  },
});
