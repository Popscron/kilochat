import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { DEFAULT_AVATAR_KEY, LOCAL_AVATARS, localAvatarKey } from '@/constants/avatars';
import { FontSize, Spacing } from '@/constants/theme';
import { fieldsForCategory, setDraftTime } from '@/generator/engine';
import { splitDateTime } from '@/generator/format';
import { getDraft, getGeneratorConfig, replaceDraft, updateDraft, useGenerator } from '@/generator/store';
import { CATEGORIES, CATEGORY_META } from '@/generator/types';
import { Chip, GeneratorHeader, SectionCard, SectionLabel, Stepper } from '@/generator/ui';
import { useTheme } from '@/hooks/use-theme';
import { pickProfilePhoto, showPhotoOptions } from '@/profile/pick-photo';

function dayLabel(daysAgo: number) {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo} days ago`;
}

function hour12(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  return { display: hour % 12 || 12, period };
}

export default function GeneratorEditScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  useGenerator();
  const draft = id ? getDraft(id) : undefined;

  useEffect(() => {
    if (!draft) router.back();
  }, [draft, router]);

  if (!draft) return null;

  const { daysAgo, hour, minute } = splitDateTime(draft.createdAt);
  const clock = hour12(hour);

  const changePhoto = () => {
    showPhotoOptions({
      title: 'Contact photo',
      onLibrary: () => {
        pickProfilePhoto('library').then((uri) => {
          if (uri) updateDraft(draft.id, { avatar: uri });
        });
      },
      onDefault: () => updateDraft(draft.id, { avatar: DEFAULT_AVATAR_KEY }),
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <GeneratorHeader title="Edit chat" onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: Spacing.five, paddingBottom: insets.bottom + Spacing.eight }}>
          <Pressable onPress={changePhoto} style={styles.avatarBlock} accessibilityLabel="Change photo">
            <Avatar uri={draft.avatar} size={88} />
            <Text style={[styles.changePhoto, { color: theme.link }]}>Change photo</Text>
          </Pressable>

          <View style={styles.localGrid}>
            {LOCAL_AVATARS.map((source, index) => {
              const key = localAvatarKey(index);
              const selected = draft.avatar === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => updateDraft(draft.id, { avatar: key })}
                  accessibilityLabel={`Local picture ${index + 1}`}
                  style={[
                    styles.localCell,
                    selected && { borderColor: theme.accent, borderWidth: 2 },
                  ]}>
                  <Image source={source} style={styles.localImage} contentFit="cover" />
                </Pressable>
              );
            })}
          </View>

          <SectionLabel>Name</SectionLabel>
          <SectionCard>
            <TextInput
              value={draft.name}
              onChangeText={(name) => updateDraft(draft.id, { name })}
              placeholder="Name"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, { color: theme.text }]}
            />
          </SectionCard>

          <SectionLabel>
            {draft.category === 'photo'
              ? 'Caption'
              : draft.category === 'voice'
                ? 'Duration'
                : draft.category === 'status'
                  ? 'Reply'
                  : 'Message'}
          </SectionLabel>
          <SectionCard>
            {draft.category === 'voice' ? (
              <Stepper
                label="Length"
                subtitle={`${Math.floor((draft.durationSec || 0) / 60)}:${String((draft.durationSec || 0) % 60).padStart(2, '0')}`}
                value={draft.durationSec || 12}
                min={5}
                max={180}
                step={5}
                onChange={(durationSec) => updateDraft(draft.id, { durationSec })}
              />
            ) : (
              <TextInput
                value={draft.text}
                onChangeText={(text) => updateDraft(draft.id, { text })}
                placeholder={
                  draft.category === 'photo' ? 'Caption' : draft.category === 'status' ? 'Status reply' : 'Message'
                }
                placeholderTextColor={theme.textTertiary}
                multiline
                style={[styles.input, styles.multiline, { color: theme.text }]}
              />
            )}
          </SectionCard>

          <SectionLabel>Category</SectionLabel>
          <View style={styles.chips}>
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                label={`${CATEGORY_META[category].emoji} ${CATEGORY_META[category].label}`}
                selected={draft.category === category}
                onPress={() =>
                  updateDraft(draft.id, {
                    category,
                    ...fieldsForCategory(category, getGeneratorConfig().style, draft.avatarSeed),
                  })
                }
              />
            ))}
          </View>

          <SectionLabel>When</SectionLabel>
          <SectionCard>
            <Stepper
              label="Day"
              subtitle={dayLabel(daysAgo)}
              value={daysAgo}
              onChange={(next) =>
                replaceDraft(setDraftTime(draft, Math.max(0, Math.min(14, next)), hour, minute))
              }
            />
            <View style={[styles.rule, { backgroundColor: theme.separator }]} />
            <Stepper
              label="Hour"
              subtitle={`${clock.display} ${clock.period}`}
              value={hour}
              onChange={(next) =>
                replaceDraft(setDraftTime(draft, daysAgo, Math.max(0, Math.min(23, next)), minute))
              }
            />
            <View style={[styles.rule, { backgroundColor: theme.separator }]} />
            <Stepper
              label="Minute"
              value={minute}
              step={5}
              onChange={(next) =>
                replaceDraft(setDraftTime(draft, daysAgo, hour, Math.max(0, Math.min(55, next))))
              }
            />
          </SectionCard>

          <SectionCard>
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>Unread in inbox</Text>
                <Text style={[styles.switchHint, { color: theme.textSecondary }]}>
                  Off means it lands as already read.
                </Text>
              </View>
              <Switch
                value={draft.unread}
                onValueChange={(unread) => updateDraft(draft.id, { unread })}
                trackColor={{ true: theme.accentBright }}
              />
            </View>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: Spacing.six,
    gap: Spacing.two,
  },
  changePhoto: {
    fontSize: FontSize.subhead,
    fontWeight: '600',
  },
  localGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.six,
  },
  localCell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  localImage: {
    width: '100%',
    height: '100%',
  },
  input: {
    fontSize: FontSize.body,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    minHeight: 52,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.six,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.four,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  switchLabel: {
    fontSize: FontSize.body,
  },
  switchHint: {
    fontSize: FontSize.footnote,
  },
});
