import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { updateMe } from '@/api/client';
import { Avatar } from '@/components/avatar';
import { GlassIconButton } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { DEFAULT_AVATAR_KEY } from '@/constants/avatars';
import { getSnapshot, updateCurrentUser, useChatData } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { pickProfilePhoto, showPhotoOptions } from '@/profile/pick-photo';

export default function EditProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useChatData();
  const profile = data.currentUser;
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim();
  const dirty = trimmed !== profile.name || avatar !== profile.avatar;
  const canSave = trimmed.length > 0 && dirty && !saving;

  const applyAvatar = (uri?: string) => {
    const next = uri || DEFAULT_AVATAR_KEY;
    setAvatar(next);
    updateCurrentUser({ avatar: next });
  };

  const changePhoto = () => {
    showPhotoOptions({
      onCamera: () => {
        pickProfilePhoto('camera').then((uri) => uri && applyAvatar(uri));
      },
      onLibrary: () => {
        pickProfilePhoto('library').then((uri) => uri && applyAvatar(uri));
      },
      onRemove: avatar && avatar !== DEFAULT_AVATAR_KEY ? () => applyAvatar(DEFAULT_AVATAR_KEY) : undefined,
    });
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const patch = { name: trimmed, avatar };
    updateCurrentUser(patch);
    try {
      if (getSnapshot().usingServer) {
        const remote: { name: string; avatar?: string } = { name: trimmed };
        if (!avatar) remote.avatar = '';
        else if (!avatar.startsWith('file:') && !avatar.startsWith('ph:') && !avatar.startsWith('content:')) {
          remote.avatar = avatar;
        }
        await updateMe(remote);
      }
      router.back();
    } catch {
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.one, borderBottomColor: theme.separator }]}>
        <GlassIconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit profile</Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel="Done"
          style={styles.doneBtn}>
          <Text style={[styles.done, { color: canSave ? theme.accent : theme.textTertiary }]}>
            {saving ? 'Saving' : 'Done'}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: Spacing.eight, paddingBottom: insets.bottom + Spacing.eight }}>
          <Pressable onPress={changePhoto} style={styles.avatarBlock} accessibilityLabel="Change profile photo">
            <Avatar uri={avatar} size={Layout.profileAvatarSize} />
            <View style={[styles.cameraBadge, { backgroundColor: theme.accent, borderColor: theme.groupedBackground }]}>
              <Icon name="cameraFill" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={[styles.changeLabel, { color: theme.link }]}>Edit photo</Text>

          <Text style={[styles.section, { color: theme.textSecondary }]}>Name</Text>
          <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={40}
              selectionColor={theme.accent}
              style={[styles.input, { color: theme.text }]}
            />
          </View>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            This name is visible to your contacts.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const BADGE = 36;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    minHeight: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  doneBtn: {
    minWidth: Layout.headerIconButtonSize,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  done: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  avatarBlock: {
    alignSelf: 'center',
    width: Layout.profileAvatarSize,
    height: Layout.profileAvatarSize,
    marginBottom: Spacing.three,
  },
  cameraBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  changeLabel: {
    textAlign: 'center',
    fontSize: FontSize.subhead,
    fontWeight: '600',
    marginBottom: Spacing.eight,
  },
  section: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.six,
    marginBottom: Spacing.two,
  },
  card: {
    marginHorizontal: Spacing.four,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  input: {
    fontSize: FontSize.body,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    minHeight: 52,
  },
  hint: {
    fontSize: FontSize.footnote,
    paddingHorizontal: Spacing.six,
    marginTop: Spacing.two,
  },
});
