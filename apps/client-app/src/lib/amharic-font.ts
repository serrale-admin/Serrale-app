import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { useAppStore } from '../store/appStore';

/**
 * Amharic font application.
 *
 * Inter (the app's Latin font) carries NO Ethiopic/Ge'ez glyphs, so every
 * `<Text>` styled with an Inter family would rely on the OS system-fallback font
 * to draw Amharic. That renders on Ethiopian-market Android/iOS but is not
 * guaranteed on the web export or on a device missing a system Ethiopic font.
 *
 * When the app language is Amharic we therefore remap each Text's resolved Inter
 * family to the matching bundled Noto Sans Ethiopic weight (loaded in
 * `app/_layout.tsx`). Noto Sans Ethiopic also renders Latin/digits acceptably,
 * so mixed strings (brand names, phone numbers) stay legible. This is the
 * brief's sanctioned "apply globally when lang=am" strategy — it keeps the ~200
 * static StyleSheets untouched instead of threading a font prop through them all.
 *
 * The patch is installed ONLY from `_layout.tsx` (the real app + web export),
 * never from the Jest test tree, and is a strict no-op when lang !== 'am', so the
 * default English experience — and every existing test — is byte-identical.
 */
const INTER_TO_ETHIOPIC: Record<string, string> = {
  Inter_400Regular: 'NotoSansEthiopic_400Regular',
  Inter_500Medium: 'NotoSansEthiopic_500Medium',
  Inter_600SemiBold: 'NotoSansEthiopic_600SemiBold',
  Inter_700Bold: 'NotoSansEthiopic_700Bold',
};

let patched = false;

/** Install the lang-aware Ethiopic font override on the RN Text primitive. Idempotent. */
export function applyAmharicFontPatch(): void {
  if (patched) return;
  patched = true;

  // `Text` is a React.forwardRef object; its `render` is the inner render fn.
  const TextInternals = RNText as unknown as {
    render?: (...args: unknown[]) => React.ReactElement | null;
  };
  const originalRender = TextInternals.render;
  if (typeof originalRender !== 'function') return; // web/other targets: skip safely.

  TextInternals.render = function patchedRender(...args: unknown[]) {
    let element: React.ReactElement | null;
    try {
      element = originalRender.apply(this, args) as React.ReactElement | null;
    } catch {
      return null;
    }
    if (!element || !React.isValidElement(element)) return element;

    try {
      if (useAppStore.getState().lang !== 'am') return element;

      const flat = (StyleSheet.flatten(
        (element.props as { style?: unknown }).style,
      ) || {}) as { fontFamily?: string };
      const mapped = flat.fontFamily
        ? INTER_TO_ETHIOPIC[flat.fontFamily]
        : 'NotoSansEthiopic_400Regular';
      if (!mapped || flat.fontFamily === mapped) return element;

      return React.cloneElement(element, {
        style: [(element.props as { style?: unknown }).style, { fontFamily: mapped }],
      } as Partial<typeof element.props>);
    } catch {
      // Never take down a screen because font remapping failed (web/HMR edge cases).
      return element;
    }
  };
}
