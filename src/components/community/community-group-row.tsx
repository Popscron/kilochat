import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { avatarImageSource } from '@/constants/avatars';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import {
  getLastGroupMessage,
  previewText,
  type Community,
  type CommunityGroup,
} from '@/data/communities';
import { useTheme } from '@/hooks/use-theme';
import { formatChatListDate } from '@/utils/format';

export const GROUP_ICON_SIZE = 52;

/** Green megaphone for Announcements, the group photo, or a grey chat bubble. */
export function CommunityGroupIcon({ group, size = GROUP_ICON_SIZE }: { group: CommunityGroup; size?: number }) {
  const theme = useTheme();
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (group.isAnnouncements) {
    return (
      <View style={[styles.iconCircle, circle, { backgroundColor: theme.chipActiveBackground }]}>
        <Icon name="megaphoneFill" size={size * 0.46} color={theme.chipActiveText} />
      </View>
    );
  }
  if (group.avatar) return <Avatar uri={group.avatar} size={size / 0.84} isGroup />;
  return (
    <View style={[styles.iconCircle, circle, { backgroundColor: theme.avatarPlaceholder }]}>
      <Icon name="groupChat" size={size * 0.5} color={theme.avatarPlaceholderIcon} />
    </View>
  );
}

/** Rounded-square community icon: photo, or a pastel tile with a people glyph. */
export function CommunityIcon({ community, size }: { community: Community; size: number }) {
  const photo = avatarImageSource(community.avatar);
  return (
    <View
      style={[
        styles.communityTile,
        { width: size, height: size, borderRadius: size * 0.22, backgroundColor: community.tint.background },
      ]}>
      {photo ? (
        <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Icon name="communitiesFill" size={size * 0.42} color={community.tint.icon} />
      )}
    </View>
  );
}

type CommunityGroupRowProps = {
  group: CommunityGroup;
  onPress: () => void;
  /** `tab`: Communities tab row. `community`: a community's own page (bold names, chevrons). */
  variant?: 'tab' | 'community';
  /** Hide the bottom separator on the last row. */
  last?: boolean;
};

export function CommunityGroupRow({ group, onPress, variant = 'tab', last }: CommunityGroupRowProps) {
  const theme = useTheme();
  const onPage = variant === 'community';
  const lastMessage = group.joined ? getLastGroupMessage(group.id) : undefined;
  const unread = group.unreadCount ?? 0;
  const subtitle = group.joined
    ? previewText(lastMessage)
    : `${group.memberCount} ${group.memberCount === 1 ? 'member' : 'members'}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && { backgroundColor: theme.rowSelected }}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <CommunityGroupIcon group={group} />
        </View>

        <View
          style={[
            styles.body,
            !onPage && !last && { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth },
          ]}>
          <View style={styles.line}>
            <Text style={[styles.name, onPage && styles.nameBold, { color: theme.text }]} numberOfLines={1}>
              {group.name}
            </Text>
            {!!lastMessage && (
              <Text style={[styles.time, { color: unread ? theme.accent : theme.textSecondary }]}>
                {formatChatListDate(lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View style={styles.line}>
            <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
            {unread > 0 ? (
              <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.badgeText, { color: theme.onAccent }]}>{unread}</Text>
              </View>
            ) : group.pinned && !onPage ? (
              <Icon name="pin" size={18} color={theme.textSecondary} />
            ) : null}
          </View>
        </View>

        {!group.joined && (
          <View style={styles.chevron}>
            <Icon name="chevronRight" size={16} color={theme.textTertiary} />
          </View>
        )}
      </View>

      {/* The community page draws full-width lines between rows. */}
      {onPage && !last && <View style={[styles.pageSeparator, { backgroundColor: theme.separator }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.four,
  },
  iconBox: {
    width: GROUP_ICON_SIZE,
    height: GROUP_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityTile: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    marginLeft: Spacing.three,
    paddingRight: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
    fontSize: FontSize.body,
  },
  nameBold: {
    fontWeight: '600',
  },
  time: {
    fontSize: FontSize.subhead - 1,
  },
  preview: {
    flex: 1,
    fontSize: FontSize.subhead,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: FontSize.footnote - 1,
    fontWeight: '600',
  },
  chevron: {
    paddingRight: Spacing.four,
    marginLeft: -Spacing.two,
  },
  pageSeparator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.four,
  },
});
