import { StyleSheet, Text, View } from 'react-native';
import { presentError } from '../lib/error-presentation';
import { Icon } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { colors, fonts } from '../lib/theme';
import Button from './Button';

interface Props {
  /**
   * A caught error to present. When provided, ErrorBlock resolves it through the
   * error-presentation mapper into localized, USER-SAFE copy (no raw message /
   * stack / backend internals) and picks the retry affordance from the mapping.
   * Explicit `title`/`text` props still win, so callers can override per-screen.
   */
  error?: unknown;
  /** Short headline, e.g. "Couldn't load providers". Overrides mapped title. */
  title?: string;
  /** One-line explanation / recovery hint. Overrides mapped message. */
  text?: string;
  /** When provided, renders a Try again button that calls this. */
  onRetry?(): void;
  retryLabel?: string;
  /** Semantic mapped action (for example sign-in after session expiry). */
  onAction?(): void;
  actionLabel?: string;
}

/**
 * Centered error state with an optional retry action. Gives every data screen a
 * consistent failure surface instead of a bare message or silent empty list.
 *
 * Pass a caught `error` to get mapped, localized copy for free (offline / 5xx /
 * 429 / maintenance / …) — the mapper guarantees nothing internal is ever shown.
 * The legacy `title`/`text` props remain for callers that want fixed copy.
 */
export default function ErrorBlock({ error, title, text, onRetry, retryLabel, onAction, actionLabel }: Props) {
  const labels = useLabels();
  const view = error !== undefined ? presentError(error, labels) : null;

  const resolvedTitle = title ?? view?.title ?? labels.errors.unknownTitle;
  const resolvedText = text ?? view?.message ?? labels.errors.offlineMessage;
  const resolvedActionLabel = actionLabel ?? retryLabel ?? view?.action ?? labels.errors.retry;
  // Session expiry has one semantic recovery: sign in. Never fall back to the
  // legacy retry callback for it. Other mapped non-retryable states render no
  // button until their screen supplies a dedicated semantic treatment.
  const actionHandler =
    view?.kind === 'session-expired' ? onAction : view && !view.retryable ? undefined : onRetry;

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.circle}>
        <Icon name="ph-warning-circle" size={28} color={colors.danger} weight="regular" />
      </View>
      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.text}>{resolvedText}</Text>
      {actionHandler ? (
        <Button label={resolvedActionLabel} icon="ph-arrow-right" variant="secondary" size="sm" onPress={actionHandler} style={styles.retry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  circle: { width: 60, height: 60, borderRadius: 999, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, marginTop: 15, textAlign: 'center' },
  text: { fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 20, textAlign: 'center', fontFamily: fonts.regular },
  retry: { marginTop: 16 },
});
