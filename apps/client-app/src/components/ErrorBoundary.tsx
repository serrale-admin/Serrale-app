import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { labelsFor } from '../lib/labels';
import { logger } from '../lib/logger';
import { colors, fonts, radius } from '../lib/theme';
import { useAppStore } from '../store/appStore';
import Button from './Button';

/**
 * Global crash boundary.
 *
 * React error boundaries MUST be class components — only `componentDidCatch` /
 * `getDerivedStateFromError` catch a render-phase throw. On catch it:
 *   1. routes the error + component stack through the production logger, which
 *      REDACTS before anything leaves (no phone/OTP/token in the crash report);
 *   2. renders a BRANDED recovery screen built from the design tokens + the
 *      shared Button primitive — never the raw error message or stack;
 *   3. offers a safe restart (`retry`): it resets its own state so the child tree
 *      re-mounts, and calls the optional `onReset` (the app passes one that
 *      navigates to a safe root route). It is NOT a native crash/reload hack.
 *
 * It has NO business logic and deliberately does not read navigation or query
 * context — those may be the very thing that crashed. Copy is read from the label
 * set synchronously via the store's current language (a class component cannot use
 * the `useLabels` hook); it is safe because a language change is not what crashed.
 */

interface Props {
  children: ReactNode;
  /**
   * Called when the user taps "restart" AFTER internal state is reset. The app
   * wires this to navigate to a safe root route. Optional so the boundary works
   * standalone (and in tests) without a router.
   */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    // Flip to the recovery UI. We intentionally do NOT stash the error in state —
    // it must never be rendered, so we don't keep it around to be leaked.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // The logger redacts before the crash reporter ever sees this. The component
    // stack is a template of component names (no user data) but is redacted too,
    // as belt-and-braces against an interpolated value in a component name.
    logger.error(error, { componentStack: info.componentStack });
    logger.addBreadcrumb({ category: 'lifecycle', message: 'render-crash' });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    // Read copy in the user's current language, non-reactively. A crash boundary
    // does not need to re-render on language change.
    const labels = labelsFor(useAppStore.getState().lang);
    const r = labels.recovery;

    return (
      <SafeAreaView style={styles.safe} accessibilityRole="alert">
        <View style={styles.body}>
          <View style={styles.circle}>
            <Icon name="ph-warning-circle" size={30} color={colors.danger} weight="regular" />
          </View>
          <Text style={styles.title}>{r.title}</Text>
          <Text style={styles.message}>{r.message}</Text>
          <Button label={r.action} icon="ph-arrow-right" onPress={this.handleReset} style={styles.action} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  circle: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 19, fontFamily: fonts.bold, color: colors.text, marginTop: 18, textAlign: 'center' },
  message: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 8,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  action: { marginTop: 22, alignSelf: 'stretch' },
});
