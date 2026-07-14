import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { DEFAULT_AUTH_BACK_ROUTE, navigateAuthBack } from '../lib/safe-route';
import { colors, fonts, shadowCard } from '../lib/theme';
import { useAppStore } from '../store/appStore';

interface Props {
  /** Where to go when there is no navigation history (default: Profile tab). */
  backFallback?: string;
  onBack?(): void;
  /** Show quick language toggle (matches categories header affordance). */
  showLanguage?: boolean;
}

/** Categories-style top bar: SERRALE logo + back / language pills. */
export default function AuthScreenHeader({ backFallback = DEFAULT_AUTH_BACK_ROUTE, onBack, showLanguage = true }: Props) {
  const router = useRouter();
  const labels = useLabels();
  const lang = useAppStore((s) => s.lang);
  const langLabel = lang === 'am' ? 'አማ' : 'EN';

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigateAuthBack(backFallback);
  };

  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backPill}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={labels.common.back}
        hitSlop={8}
      >
        <Icon name="ph-arrow-left" size={16} color={colors.green800} weight="bold" />
      </Pressable>

      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="SERRALE"
      />

      {showLanguage ? (
        <Pressable
          style={styles.langPill}
          onPress={() => router.push('/language')}
          accessibilityRole="button"
          accessibilityLabel={labels.common.language}
        >
          <Icon name="ph-globe" size={14} color={colors.success} weight="fill" />
          <Text style={styles.langText}>{langLabel}</Text>
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 6,
    gap: 8,
  },
  backPill: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowCard,
    shadowOpacity: 0.05,
  },
  backSpacer: { width: 40 },
  logo: { flex: 1, height: 38, width: undefined, tintColor: colors.green800 },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...shadowCard,
    shadowOpacity: 0.05,
  },
  langText: { fontSize: 13, fontFamily: fonts.bold, color: colors.text },
});
