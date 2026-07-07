/**
 * SERRALE Basic design tokens (from SERRALE_Basic_Design_System.md).
 * Single source of truth for colors, fonts, spacing, radius and shadows.
 */

export const colors = {
  green900: '#033528',
  green800: '#064734',
  green700: '#086246',
  soft: '#F1FBF5',
  sage: '#CDE1D4',

  bg: '#FFFEFC',
  surface: '#FFFFFF',
  ivory: '#FFFEFA',

  // Frosted-glass green surfaces (category cards). Simulated glass: no BlurView dependency.
  frost: '#E8F4EC',
  frostDeep: '#DCEDE2',
  frostBorder: 'rgba(6,71,52,0.11)',
  frostHi: 'rgba(255,255,255,0.6)',

  text: '#102E25',
  muted: '#65756D',
  faint: '#9aa39d',

  gold: '#F6B93B',
  goldSoft: '#FFF4D8',
  goldText: '#b8851a',
  /** Darker amber for small text on goldSoft — meets WCAG AA (4.9:1). */
  goldSoftText: '#8a6410',
  onGold: '#5e4708',
  /** Darkened from #16875F for WCAG AA on soft/white surfaces (4.72-4.99:1). */
  success: '#157F59',
  whatsapp: '#0f6f4d',
  whatsappSoft: 'rgba(22,135,95,0.25)',
  /** Darkened from #C8553D for WCAG AA (4.5:1) on bg/surface/ivory (4.68-4.72:1). */
  danger: '#C0503A',
  dangerSoft: '#FBEAE6',

  border: 'rgba(6,71,52,0.1)',
  borderStrong: 'rgba(6,71,52,0.14)',
  borderField: 'rgba(6,71,52,0.14)',
  borderInput: 'rgba(6,71,52,0.18)',
  borderSoft: 'rgba(6,71,52,0.06)',
  divider: 'rgba(6,71,52,0.05)',
  onDark: '#FFFFFF',
} as const;

/** Opacity applied to pressable surfaces while pressed. */
export const pressedOpacity = 0.64;

/** Font family names exposed by the @expo-google-fonts packages. */
export const fonts = {
  heading: 'Inter_700Bold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const radius = {
  sm: 6,
  md: 9,
  lg: 12,
  xl: 14,
  xxl: 16,
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

/** Shared compact layout values used across the mobile product UI. */
export const layout = {
  gutter: 14,
  sectionGap: 16,
  controlHeight: 44,
  touchTarget: 44,
  contentMaxWidth: 520,
} as const;

/** Soft card shadow (iOS) + elevation (Android). */
export const shadowCard = {
  shadowColor: '#064734',
  shadowOpacity: 0.045,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
} as const;

export const shadowSheet = {
  shadowColor: '#064734',
  shadowOpacity: 0.16,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: -12 },
  elevation: 12,
} as const;

/** Per-group gradient endpoints for category medallions (web-aligned groups). */
export const groupGradient: Record<string, [string, string]> = {
  'Home Services': ['#0a5d3f', '#13845a'],
  'Repairs & Maintenance': ['#0e5c44', '#34805f'],
  'Moving & Transport': ['#0a5f54', '#16897e'],
  'Health & Wellness': ['#1c6b45', '#43935a'],
};

export function gradFor(group: string): [string, string] {
  return groupGradient[group] || ['#0a5d3f', '#13845a'];
}
