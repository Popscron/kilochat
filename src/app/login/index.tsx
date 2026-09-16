import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/context';
import { useLoginCountry } from '@/auth/login-country';
import { formatInternational, isCompleteNumber, nationalDigits, toE164 } from '@/auth/phone';
import { Icon } from '@/components/icon';
import { GlassSurface } from '@/components/glass-surface';
import { countryFlag } from '@/constants/countries';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginPhoneScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const country = useLoginCountry();
  const [national, setNational] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const complete = isCompleteNumber(country, national);
  const e164 = toE164(country, national);
  const pretty = formatInternational(country, national);

  const submit = () => {
    if (!complete || busy) return;
    Alert.alert(
      'You entered the phone number:',
      `${pretty}\n\nIs this OK, or would you like to edit the number?`,
      [
        { text: 'Edit', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            setBusy(true);
            signIn(e164)
              .catch((err: Error) => {
                Alert.alert(
                  "Couldn't verify",
                  err.message || 'Check that your phone number is correct and try again.'
                );
              })
              .finally(() => setBusy(false));
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.one }]}>
        <View style={styles.headerSpacer} />
        <Pressable
          accessibilityLabel="More options"
          hitSlop={12}
          onPress={() => setMenuOpen(true)}
          style={styles.moreBtn}>
          <Icon name="more" size={22} color={theme.icon} />
        </Pressable>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>Enter your phone number</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        WhatsApp will need to verify your account. Carrier charges may apply.
      </Text>

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Country, ${country.name}`}
          onPress={() => router.push('/login/country')}
          style={({ pressed }) => [styles.countryRow, pressed && { opacity: 0.7 }]}>
          <Text style={styles.flag}>{countryFlag(country)}</Text>
          <Text style={[styles.countryName, { color: theme.accent }]}>{country.name}</Text>
          <Icon name="chevronRight" size={16} color={theme.textTertiary} />
        </Pressable>
        <View style={[styles.rule, { backgroundColor: theme.separator }]} />
        <View style={styles.numberRow}>
          <Text style={[styles.dial, { color: theme.text }]}>+{country.dial}</Text>
          <View style={[styles.vRule, { backgroundColor: theme.separator }]} />
          <TextInput
            value={national}
            onChangeText={(value) => setNational(nationalDigits(value).slice(0, country.length + 1))}
            placeholder="your phone number"
            placeholderTextColor={theme.textTertiary}
            keyboardType="phone-pad"
            autoFocus
            caretHidden={false}
            selectionColor={theme.accent}
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={country.length + 1}
            style={[styles.input, { color: theme.text }]}
            onSubmitEditing={submit}
          />
        </View>
      </View>

      <View style={styles.flex} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next"
        disabled={!complete || busy}
        onPress={submit}
        style={({ pressed }) => [
          styles.next,
          {
            backgroundColor: complete ? theme.accent : theme.backgroundElement,
            marginBottom: Math.max(insets.bottom, Spacing.four),
            opacity: pressed && complete ? 0.85 : 1,
          },
        ]}>
        {busy ? (
          <ActivityIndicator color={complete ? theme.onAccent : theme.textTertiary} />
        ) : (
          <Text style={[styles.nextLabel, { color: complete ? theme.onAccent : theme.textTertiary }]}>
            Next
          </Text>
        )}
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuAnchor, { top: insets.top + Spacing.two, right: Spacing.four }]}>
            <GlassSurface style={styles.menuCard}>
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/login/help');
                }}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { backgroundColor: theme.groupedCardPressed },
                ]}>
                <Text style={[styles.menuLabel, { color: theme.text }]}>Help</Text>
              </Pressable>
            </GlassSurface>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: Layout.topBarHeight + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
  },
  headerSpacer: {
    flex: 1,
  },
  moreBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.six,
  },
  subtitle: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.six,
    paddingHorizontal: Spacing.eight,
  },
  card: {
    marginHorizontal: Spacing.five,
    borderRadius: Radius.medium + 2,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  countryRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  flag: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '500',
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.four,
  },
  numberRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  dial: {
    fontSize: FontSize.body,
    fontWeight: '500',
  },
  vRule: {
    width: StyleSheet.hairlineWidth,
    height: 22,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    paddingVertical: 0,
  },
  flex: {
    flex: 1,
  },
  next: {
    marginHorizontal: Spacing.five,
    height: 50,
    borderRadius: Radius.medium + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
  },
  menuAnchor: {
    position: 'absolute',
    minWidth: 180,
  },
  menuCard: {
    borderRadius: Radius.medium,
    overflow: 'hidden',
    minWidth: 180,
  },
  menuRow: {
    minHeight: Layout.settingsRowHeight - 4,
    paddingHorizontal: Spacing.five,
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: FontSize.body,
  },
});
