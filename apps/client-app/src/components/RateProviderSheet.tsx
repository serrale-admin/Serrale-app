import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomSheet from './BottomSheet';
import Button from './Button';
import { Icon } from '../lib/icons';
import { fill, useLabels } from '../lib/labels';
import { colors, fonts, radius } from '../lib/theme';

interface Props {
  visible: boolean;
  providerName: string;
  submitting?: boolean;
  onClose(): void;
  onSubmit(input: { rating: number; comment: string }): void;
}

/** Production-style rate sheet: stars + optional comment + single submit. */
export default function RateProviderSheet({
  visible,
  providerName,
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const labels = useLabels();
  const t = labels.rating;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const resetAndClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const handleSubmit = () => {
    if (rating < 1 || submitting) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <BottomSheet visible={visible} onClose={resetAndClose} contentStyle={styles.pad}>
      <Text style={styles.title}>{t.sheetTitle}</Text>
      <Text style={styles.sub}>{fill(t.sheetSub, { name: providerName })}</Text>

      <View style={styles.stars} accessibilityRole="adjustable" accessibilityLabel={t.starsA11y}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= rating;
          return (
            <Pressable
              key={n}
              onPress={() => setRating(n)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${n}`}
              accessibilityState={{ selected: filled }}
            >
              <Icon
                name="ph-star"
                size={36}
                color={filled ? colors.gold : 'rgba(6,71,52,0.22)'}
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

      <Button
        label={submitting ? t.submitting : t.submit}
        onPress={handleSubmit}
        disabled={rating < 1 || submitting}
        loading={submitting}
        fullWidth
        size="md"
      />
      {!submitting && (
        <Pressable style={styles.cancel} onPress={resetAndClose} hitSlop={8}>
          <Text style={styles.cancelText}>{labels.common.cancel}</Text>
        </Pressable>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 4 },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginTop: 4,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.12)',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  hint: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 14,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  cancel: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.muted },
});
