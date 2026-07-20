import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from './BottomSheet';
import { Icon } from '../lib/icons';
import { fill, useLabels } from '../lib/labels';
import { colors, fonts, radius } from '../lib/theme';

interface Props {
  visible: boolean;
  providerName: string;
  submitting?: boolean;
  errorText?: string | null;
  onClose(): void;
  onSubmit(input: { rating: number; comment: string }): void | Promise<void>;
}

/** Compact liquid-glass rate sheet: stars + optional comment + submit. */
export default function RateProviderSheet({
  visible,
  providerName,
  submitting = false,
  errorText = null,
  onClose,
  onSubmit,
}: Props) {
  const labels = useLabels();
  const t = labels.rating;
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!visible) return;
    setRating(0);
    setHover(0);
    setComment('');
  }, [visible]);

  const resetAndClose = () => {
    if (submitting) return;
    setRating(0);
    setHover(0);
    setComment('');
    onClose();
  };

  const handleSubmit = () => {
    if (rating < 1 || submitting) return;
    void onSubmit({ rating, comment: comment.trim() });
  };

  const active = hover || rating;
  const canSubmit = rating >= 1 && !submitting;

  return (
    <BottomSheet
      visible={visible}
      onClose={resetAndClose}
      contentStyle={styles.sheetFlush}
      glass
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={[styles.pad, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
        >
          <LinearGradient
            colors={[colors.glassWhiteHi, colors.glassWhite, colors.glassWhiteDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassCard}
          >
            <View style={styles.headerRow}>
              <View style={styles.starBadge}>
                <Icon name="ph-star" size={16} color={colors.gold} weight="fill" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.title}>{t.sheetTitle}</Text>
                <Text style={styles.sub} numberOfLines={2}>
                  {fill(t.sheetSub, { name: providerName })}
                </Text>
              </View>
            </View>

            <View style={styles.stars} accessibilityRole="adjustable" accessibilityLabel={t.starsA11y}>
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= active;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setRating(n)}
                    onPressIn={() => setHover(n)}
                    onPressOut={() => setHover(0)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={`${n}`}
                    accessibilityState={{ selected: n <= rating }}
                    style={({ pressed }) => [styles.starHit, pressed && { transform: [{ scale: 0.92 }] }]}
                  >
                    <Icon
                      name="ph-star"
                      size={30}
                      color={filled ? colors.gold : colors.starEmpty}
                      weight={filled ? 'fill' : 'regular'}
                    />
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder={t.commentPlaceholder}
              placeholderTextColor={colors.muted}
              multiline
              maxLength={400}
              textAlignVertical="top"
              editable={!submitting}
            />
            <Text style={styles.hint}>{comment.length}/400</Text>

            {!!errorText && (
              <View style={styles.errorBox} accessibilityLiveRegion="polite">
                <Icon name="ph-warning-circle" size={15} color={colors.danger} weight="fill" />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel={submitting ? t.submitting : t.submit}
              accessibilityState={{ disabled: !canSubmit, busy: submitting }}
              style={({ pressed }) => [
                styles.submit,
                canSubmit ? styles.submitReady : styles.submitInert,
                pressed && canSubmit && { opacity: 0.9 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="ph-paper-plane-tilt" size={16} color="#fff" weight="fill" />
                  <Text style={styles.submitLabel}>{t.submit}</Text>
                </>
              )}
            </Pressable>

            {!submitting && (
              <Pressable style={styles.cancel} onPress={resetAndClose} hitSlop={8}>
                <Text style={styles.cancelText}>{labels.common.cancel}</Text>
              </Pressable>
            )}
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetFlush: {
    backgroundColor: colors.glassWhite,
    paddingBottom: 0,
  },
  pad: {
    paddingHorizontal: 14,
    paddingTop: 2,
  },
  glassCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.glassWhiteBorder,
    backgroundColor: colors.glassWhiteHi,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    overflow: 'hidden',
    shadowColor: '#033528',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  starBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(246,185,59,0.4)',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.2,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 3,
    lineHeight: 17,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
    paddingVertical: 4,
  },
  starHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 72,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  hint: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 10,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(192,80,58,0.22)',
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.danger,
    lineHeight: 17,
  },
  submit: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitReady: {
    backgroundColor: colors.green800,
  },
  submitInert: {
    backgroundColor: '#9AABA3',
  },
  submitLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#fff',
  },
  cancel: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted },
});
