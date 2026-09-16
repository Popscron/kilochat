import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { applyGeneratedChats } from '@/data/store';
import { formatPreviewWhen } from '@/generator/format';
import { clearDrafts, deleteDraft, generatePreview, regenerateOne, useGenerator } from '@/generator/store';
import { CATEGORY_META, type DraftChat } from '@/generator/types';
import { GeneratorHeader, PrimaryButton } from '@/generator/ui';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/utils/format';

export default function GeneratorPreviewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { drafts } = useGenerator();

  const apply = () => {
    if (!drafts.length) return;
    Alert.alert(
      'Apply chats',
      `Add ${drafts.length} chat${drafts.length === 1 ? '' : 's'} to your inbox?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            applyGeneratedChats(
              drafts.map((draft) => ({
                name: draft.name,
                avatar: draft.avatar,
                phone: draft.phone,
                text: draft.text,
                imageUri: draft.imageUri,
                durationSec: draft.durationSec,
                category: draft.category,
                createdAt: draft.createdAt,
                unread: draft.unread,
              }))
            );
            clearDrafts();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <GeneratorHeader title="Preview" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{ paddingTop: Spacing.four, paddingBottom: insets.bottom + 88 }}>
        <Text style={[styles.lead, { color: theme.textSecondary }]}>
          Edit anything here. The inbox stays untouched until you apply.
        </Text>

        {drafts.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No drafts. Go back and generate a preview.
          </Text>
        ) : (
          drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onEdit={() => router.push({ pathname: '/generator/edit', params: { id: draft.id } })}
              onRegenerate={() => regenerateOne(draft.id)}
              onDelete={() =>
                Alert.alert('Delete this chat?', draft.name, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteDraft(draft.id) },
                ])
              }
            />
          ))
        )}

        {drafts.length > 0 && (
          <Pressable onPress={() => generatePreview()} style={styles.again}>
            <Text style={[styles.againLabel, { color: theme.link }]}>Regenerate all</Text>
          </Pressable>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.three,
            backgroundColor: theme.groupedBackground,
            borderTopColor: theme.separator,
          },
        ]}>
        <PrimaryButton
          label={drafts.length ? `Apply Chats · ${drafts.length}` : 'Nothing to apply'}
          onPress={apply}
          disabled={!drafts.length}
        />
      </View>
    </View>
  );
}

function DraftCard({
  draft,
  onEdit,
  onRegenerate,
  onDelete,
}: {
  draft: DraftChat;
  onEdit: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const category = CATEGORY_META[draft.category];

  return (
    <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>
      <View style={styles.cardTop}>
        <Avatar uri={draft.avatar} size={48} />
        <View style={styles.cardCopy}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {draft.name}
            </Text>
            {draft.unread ? (
              <View style={[styles.unreadDot, { backgroundColor: theme.accentBright }]} />
            ) : null}
          </View>
          {draft.category === 'photo' || draft.category === 'voice' || draft.category === 'status' ? (
            <View style={styles.previewLine}>
              <Icon
                name={
                  draft.category === 'photo'
                    ? 'cameraFill'
                    : draft.category === 'voice'
                      ? draft.unread
                        ? 'micUnread'
                        : 'micFill'
                      : 'status'
                }
                size={18}
                color={theme.textSecondary}
              />
              <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={1}>
                {draft.category === 'photo'
                  ? draft.text || 'Photo'
                  : draft.category === 'voice'
                    ? `Voice message (${formatDuration(draft.durationSec || 0)})`
                    : draft.text}
              </Text>
            </View>
          ) : (
            <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
              “{draft.text}”
            </Text>
          )}
          <Text style={[styles.meta, { color: theme.textTertiary }]}>
            {category.emoji} {category.label} · {formatPreviewWhen(draft.createdAt)}
          </Text>
        </View>
      </View>
      <View style={[styles.actions, { borderTopColor: theme.separator }]}>
        <Action label="Regenerate" color={theme.link} onPress={onRegenerate} />
        <Action label="Edit" color={theme.text} onPress={onEdit} />
        <Action label="Delete" color="#E53935" onPress={onDelete} />
      </View>
    </View>
  );
}

function Action({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.action}>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  lead: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
    paddingHorizontal: Spacing.six,
    marginBottom: Spacing.four,
  },
  empty: {
    fontSize: FontSize.subhead,
    textAlign: 'center',
    padding: Spacing.eight,
  },
  card: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  cardTop: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    flex: 1,
    fontSize: FontSize.subhead,
    lineHeight: 20,
  },
  previewLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: FontSize.caption,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
  },
  again: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  againLabel: {
    fontSize: FontSize.subhead,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
});
