import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUser,
} from '@/api/client';
import { GlassIconButton } from '@/components/glass-surface';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { getCurrentUser } from '@/data';
import { updateCurrentUser } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

type FormMode = 'add' | 'points' | null;

export default function AdminUsersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormMode>(null);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [points, setPoints] = useState('10');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await listAdminUsers();
      setUsers(result.users ?? []);
    } catch (err) {
      Alert.alert('Could not load users', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const closeForm = () => {
    setForm(null);
    setTarget(null);
    setName('');
    setPhone('');
    setPoints('10');
  };

  const saveAdd = async () => {
    if (saving) return;
    const trimmed = name.trim();
    if (!trimmed || !phone.trim()) {
      Alert.alert('Name and phone are required');
      return;
    }
    setSaving(true);
    try {
      await createAdminUser({
        name: trimmed,
        phone: phone.trim(),
        points: Math.max(0, Math.floor(Number(points) || 0)),
      });
      closeForm();
      await load();
    } catch (err) {
      Alert.alert('Could not add user', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  const savePoints = async () => {
    if (!target || saving) return;
    const add = Math.floor(Number(points) || 0);
    if (!add) {
      Alert.alert('Enter how many points to add');
      return;
    }
    setSaving(true);
    try {
      const result = await updateAdminUser(target.id, { addPoints: add });
      if (result.user?.id === getCurrentUser().id) {
        updateCurrentUser({ points: result.user.points });
      }
      closeForm();
      await load();
    } catch (err) {
      Alert.alert('Could not add points', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (user: AdminUser) => {
    if (user.isOwner) return;
    const next = user.status === 'suspended' ? 'active' : 'suspended';
    Alert.alert(
      next === 'suspended' ? 'Suspend this user?' : 'Activate this user?',
      user.name,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: next === 'suspended' ? 'Suspend' : 'Activate',
          style: next === 'suspended' ? 'destructive' : 'default',
          onPress: () => {
            void updateAdminUser(user.id, { status: next })
              .then(load)
              .catch((err: Error) => Alert.alert('Could not update', err.message));
          },
        },
      ]
    );
  };

  const removeUser = (user: AdminUser) => {
    if (user.isOwner) return;
    Alert.alert('Remove this user?', `${user.name}\n${user.phone}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void deleteAdminUser(user.id)
            .then(load)
            .catch((err: Error) => Alert.alert('Could not remove', err.message));
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.one, borderBottomColor: theme.separator }]}>
        <GlassIconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.text }]}>Users</Text>
        <Pressable
          onPress={() => {
            setPoints('10');
            setForm('add');
          }}
          hitSlop={8}
          style={styles.headerAction}>
          <Text style={[styles.headerActionText, { color: theme.link }]}>Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.accent} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: Spacing.five,
            paddingBottom: insets.bottom + Spacing.eight,
          }}>
          <Text style={[styles.lead, { color: theme.textSecondary }]}>
            Each generate uses 1 point. Remaining points show on the user and in Chat Generator.
          </Text>
          <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>
            {users.map((user, index) => (
              <View
                key={user.id}
                style={[
                  styles.userBlock,
                  index < users.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.separator },
                ]}>
                <View style={styles.userTop}>
                  <View style={styles.userText}>
                    <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                      {user.name}
                      {user.isOwner ? ' · Owner' : ''}
                    </Text>
                    <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user.phone}</Text>
                  </View>
                  <View style={styles.badges}>
                    <Text style={[styles.points, { color: theme.accent }]}>{user.points} pts</Text>
                    <Text
                      style={[
                        styles.status,
                        { color: user.status === 'suspended' ? theme.destructive : theme.textSecondary },
                      ]}>
                      {user.status === 'suspended' ? 'Suspended' : 'Active'}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Action
                    label="Points"
                    color={theme.link}
                    onPress={() => {
                      setTarget(user);
                      setPoints('10');
                      setForm('points');
                    }}
                  />
                  {!user.isOwner && (
                    <>
                      <Action
                        label={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        color={theme.text}
                        onPress={() => toggleStatus(user)}
                      />
                      <Action label="Remove" color={theme.destructive} onPress={() => removeUser(user)} />
                    </>
                  )}
                </View>
              </View>
            ))}
            {users.length === 0 && (
              <Text style={[styles.empty, { color: theme.textSecondary }]}>No users yet.</Text>
            )}
          </View>
        </ScrollView>
      )}

      <Modal visible={form !== null} animationType="slide" transparent onRequestClose={closeForm}>
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.modalDim} onPress={closeForm} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.groupedCard, paddingBottom: insets.bottom + Spacing.four },
            ]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              {form === 'add' ? 'Add user' : `Give points · ${target?.name ?? ''}`}
            </Text>
            {form === 'add' && (
              <>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Name"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="words"
                  style={[styles.input, { color: theme.text, borderColor: theme.separator }]}
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone · 0535899507"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="phone-pad"
                  style={[styles.input, { color: theme.text, borderColor: theme.separator }]}
                />
              </>
            )}
            <TextInput
              value={points}
              onChangeText={setPoints}
              placeholder={form === 'add' ? 'Starting points' : 'Points to add'}
              placeholderTextColor={theme.textTertiary}
              keyboardType="number-pad"
              style={[styles.input, { color: theme.text, borderColor: theme.separator }]}
            />
            <Pressable
              onPress={form === 'add' ? saveAdd : savePoints}
              disabled={saving}
              style={[styles.save, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
              <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save'}</Text>
            </Pressable>
            <Pressable onPress={closeForm} style={styles.cancel}>
              <Text style={[styles.cancelLabel, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function Action({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => pressed && { opacity: 0.6 }}>
      <Text style={[styles.action, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    minHeight: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  headerAction: {
    minWidth: Layout.headerIconButtonSize,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  loader: {
    marginTop: Spacing.eight,
  },
  lead: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
    paddingHorizontal: Spacing.six,
    marginBottom: Spacing.four,
  },
  card: {
    marginHorizontal: Spacing.four,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  userBlock: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: FontSize.footnote,
    marginTop: 2,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 2,
  },
  points: {
    fontSize: FontSize.subhead,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  status: {
    fontSize: FontSize.caption,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  action: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
  },
  empty: {
    padding: Spacing.four,
    fontSize: FontSize.subhead,
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.two,
  },
  sheetTitle: {
    fontSize: FontSize.title,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: FontSize.body,
  },
  save: {
    marginTop: Spacing.two,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  cancelLabel: {
    fontSize: FontSize.subhead,
  },
});
