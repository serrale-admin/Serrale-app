const AVATAR_PALETTE = ['#064734', '#086246', '#16875F', '#0b5a40', '#2f6f57', '#0e5c44'];

/** Stable avatar color derived from a provider/user name. */
export function avatarColor(name: string): string {
  const n = name || '';
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

/** Up-to-two-letter initials for avatar fallbacks. */
export function initialsOf(name: string): string {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Formats a provider count like "1,200+". */
export function fmt(n: number): string {
  return n.toLocaleString('en-US') + '+';
}
