import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useChatData } from '@/data';
import { spendGeneratePoint } from '@/generator/credits';
import {
  CATEGORIES,
  CATEGORY_META,
  MAX_PER_CATEGORY,
  MAX_TOTAL_CHATS,
  STYLE_LABELS,
  STYLES,
  TIME_MODE_LABELS,
  TIME_MODES,
  totalChats,
} from '@/generator/types';
import {
  Chip,
  GeneratorHeader,
  PrimaryButton,
  SectionCard,
  SectionLabel,
  Stepper,
} from '@/generator/ui';
import {
  addProfileImages,
  generatePreview,
  removeProfileImage,
  setCategoryCount,
  setGeneratorConfig,
  setTotalChats,
  useGenerator,
} from '@/generator/store';
import { useTheme } from '@/hooks/use-theme';
import { pickProfilePhotos } from '@/profile/pick-photo';

function dayLabel(daysAgo: number) {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo} days ago`;
}

export default function GeneratorConfigureScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { config, profileImages } = useGenerator();
  const { currentUser } = useChatData();
  const remaining = currentUser.points ?? 0;
  const total = totalChats(config.counts);
  const photosNeeded = Math.max(0, total - profileImages.length);
  const canGenerate = total > 0 && profileImages.length >= total && remaining > 0;

  const addPhotos = async () => {
    const remaining = MAX_TOTAL_CHATS - profileImages.length;
    if (remaining <= 0) return;
    const uris = await pickProfilePhotos(remaining);
    if (uris.length) addProfileImages(uris);
  };

  const onGenerate = () => {
    if (!canGenerate) return;
    void spendGeneratePoint()
      .then(() => {
        generatePreview();
        router.push('/generator/preview');
      })
      .catch((err: Error) => {
        Alert.alert('Cannot generate', err.message || 'No points remaining.');
      });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <GeneratorHeader
        title="Chat Generator"
        onBack={() => router.back()}
        right={
          <Text style={{ color: theme.textSecondary, fontSize: 15, fontWeight: '600' }}>
            {`${remaining} pts`}
          </Text>
        }
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: Spacing.five, paddingBottom: insets.bottom + Spacing.eight }}>
        <Text style={[styles.lead, { color: theme.textSecondary }]}>
          Set the mix, then preview. Nothing goes into your inbox until you tap Apply Chats.
        </Text>

        <SectionLabel>Categories</SectionLabel>
        <SectionCard>
          {CATEGORIES.map((key, index) => (
            <View key={key}>
              {index > 0 && <View style={[styles.rule, { backgroundColor: theme.separator }]} />}
              <Stepper
                label={`${CATEGORY_META[key].emoji}  ${CATEGORY_META[key].label}`}
                value={config.counts[key]}
                min={0}
                max={Math.min(MAX_PER_CATEGORY, MAX_TOTAL_CHATS - (total - config.counts[key]))}
                onChange={(next) => setCategoryCount(key, next)}
              />
            </View>
          ))}
          <View style={[styles.rule, { backgroundColor: theme.separator }]} />
          <Stepper
            label="Total chats"
            value={total}
            min={0}
            max={MAX_TOTAL_CHATS}
            onChange={setTotalChats}
          />
        </SectionCard>

        <SectionLabel>Profile photos</SectionLabel>
        <SectionCard>
          <View style={styles.photoIntro}>
            <Text style={[styles.photoCount, { color: theme.text }]}>
              {profileImages.length} / {total || 0}
            </Text>
            <Text style={[styles.photoHint, { color: theme.textSecondary }]}>
              Upload at least one photo per chat. If total chats is {total || 0}, you need{' '}
              {total || 0} photo{total === 1 ? '' : 's'}.
            </Text>
          </View>
          <View style={styles.photoGrid}>
            {profileImages.map((uri) => (
              <View key={uri} style={styles.photoCell}>
                <Image source={{ uri }} style={styles.photoImage} contentFit="cover" />
                <Pressable
                  accessibilityLabel="Remove photo"
                  hitSlop={8}
                  onPress={() => removeProfileImage(uri)}
                  style={[styles.photoRemove, { backgroundColor: theme.background }]}>
                  <Icon name="close" size={12} color={theme.text} />
                </Pressable>
              </View>
            ))}
            {profileImages.length < MAX_TOTAL_CHATS && (
              <Pressable
                accessibilityLabel="Upload profile photos"
                onPress={addPhotos}
                style={[
                  styles.photoAdd,
                  { borderColor: theme.chipBorder, backgroundColor: theme.backgroundElement },
                ]}>
                <Icon name="plus" size={22} color={theme.textSecondary} />
                <Text style={[styles.photoAddLabel, { color: theme.textSecondary }]}>Add</Text>
              </Pressable>
            )}
          </View>
        </SectionCard>

        <SectionLabel>Message style</SectionLabel>
        <View style={styles.chips}>
          {STYLES.map((style) => (
            <Chip
              key={style}
              label={STYLE_LABELS[style]}
              selected={config.style === style}
              onPress={() => setGeneratorConfig({ style })}
            />
          ))}
        </View>

        <SectionLabel>Time</SectionLabel>
        <View style={styles.chips}>
          {TIME_MODES.map((mode) => (
            <Chip
              key={mode}
              label={TIME_MODE_LABELS[mode]}
              selected={config.timeMode === mode}
              onPress={() => setGeneratorConfig({ timeMode: mode })}
            />
          ))}
        </View>
        {config.timeMode === 'range' && (
          <SectionCard>
            <Stepper
              label="Newest"
              subtitle={dayLabel(config.rangeFromDays)}
              value={config.rangeFromDays}
              onChange={(next) => setGeneratorConfig({ rangeFromDays: Math.max(0, Math.min(14, next)) })}
            />
            <View style={[styles.rule, { backgroundColor: theme.separator }]} />
            <Stepper
              label="Oldest"
              subtitle={dayLabel(config.rangeToDays)}
              value={config.rangeToDays}
              onChange={(next) => setGeneratorConfig({ rangeToDays: Math.max(0, Math.min(14, next)) })}
            />
          </SectionCard>
        )}
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          You can still change any chat’s name, photo, message, and time in the preview.
        </Text>

        <PrimaryButton
          label={
            !total
              ? 'Add at least one chat'
              : photosNeeded
                ? `Upload ${photosNeeded} more photo${photosNeeded === 1 ? '' : 's'}`
                : remaining < 1
                  ? 'No points remaining'
                  : `Generate preview · ${total}`
          }
          onPress={onGenerate}
          disabled={!canGenerate}
        />
      </ScrollView>
    </View>
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
    marginBottom: Spacing.six,
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
  hint: {
    fontSize: FontSize.footnote,
    paddingHorizontal: Spacing.six,
    marginBottom: Spacing.six,
    lineHeight: 18,
  },
  photoIntro: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    gap: 4,
  },
  photoCount: {
    fontSize: FontSize.body,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  photoHint: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  photoCell: {
    width: 64,
    height: 64,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAdd: {
    width: 64,
    height: 64,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  photoAddLabel: {
    fontSize: FontSize.caption,
    fontWeight: '600',
  },
});
