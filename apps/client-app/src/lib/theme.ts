/**
 * SERRALE Basic design tokens (from SERRALE_Basic_Design_System.md).
 * Single source of truth for colors, fonts, spacing, radius and shadows.
 */

export const colors = {
  green900: '#033528',
  green800: '#064734',
  green700: '#086246',
  soft: '#EAF8EF',
  sage: '#BFD8C8',

  bg: '#FAF7EF',
  surface: '#FFFFFF',
  ivory: '#FFFDF7',

  // Frosted-glass green surfaces (category cards). Simulated glass: no BlurView dependency.
  frost: '#DCEFE4',
  frostDeep: '#CFE6DA',
  frostBorder: 'rgba(6,71,52,0.13)',
  frostHi: 'rgba(255,255,255,0.55)',

  text: '#102E25',
  muted: '#65756D',
  faint: '#9aa39d',

  gold: '#F6B93B',
  goldSoft: '#FFF4D8',
  goldText: '#b8851a',
  success: '#16875F',
  whatsapp: '#0f6f4d',
  danger: '#C8553D',

  border: 'rgba(6,71,52,0.12)',
  borderSoft: 'rgba(6,71,52,0.08)',
  divider: 'rgba(6,71,52,0.07)',
} as const;

/** Font family names exposed by the @expo-google-fonts packages. */
export const fonts = {
  heading: 'Fraunces_600SemiBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 24,
  pill: 999,
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
} as const;

/** Soft card shadow (iOS) + elevation (Android). */
export const shadowCard = {
  shadowColor: '#064734',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

export const shadowSheet = {
  shadowColor: '#064734',
  shadowOpacity: 0.16,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: -12 },
  elevation: 12,
} as const;

/** Per-group gradient endpoints for category medallions. */
export const groupGradient: Record<string, [string, string]> = {
  'Home & Repair': ['#0a5d3f', '#13845a'],
  'Cleaning & Care': ['#0c6b4d', '#1aa073'],
  'Moving & Delivery': ['#0a5f54', '#16897e'],
  'Events & Personal': ['#1c6b45', '#43935a'],
  'Digital & Office': ['#0e5c44', '#34805f'],
};

export function gradFor(group: string): [string, string] {
  return groupGradient[group] || ['#0a5d3f', '#13845a'];
}
