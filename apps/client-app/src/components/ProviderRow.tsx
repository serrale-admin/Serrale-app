import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useProviderActions } from '../hooks/useProviderActions';
import { Icon } from '../lib/icons';
import { colors, fonts, radius, shadowCard } from '../lib/theme';
import { useAppStore } from '../store/appStore';
import type { Provider } from '../types';
import Avatar from './Avatar';

/**
 * ProviderCompactCard — the most important component in the app.
 * Avatar, name + one trust badge, rating/service/area, one-line description,
 * and Call / WhatsApp actions with availability.
 */
export default function ProviderRow({ provider: p }: { provider: Provider }) {
  const { open, save, call, whatsapp } = useProviderActions();
  const saved = useAppStore((s) => !!s.saved[p.id]);

  const badge = p.verified ? 'Verified' : p.adminReviewed ? 'Reviewed' : p.hasPastWork ? 'Past work' : '';
  const availLabel = p.availableToday ? 'Today' : 'This week';
  const availColor = p.availableToday ? colors.success : '#9a8a5a';

  return (
    <Pressable style={styles.card} onPress={() => open(p.id)}>
      <Avatar name={p.name} size={48} radius={12} fontSize={17} imageUrl={p.imageUrl} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {p.name}
          </Text>
          {!!badge && (
            <View style={styles.badge}>
              <Icon name="ph-seal-check" size={11} color={colors.success} weight="fill" />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Pressable hitSlop={8} onPress={() => save(p.id)} accessibilityLabel={`Save ${p.name}`}>
            <Icon
              name="ph-bookmark-simple"
              size={19}
              color={saved ? colors.gold : colors.faint}
              weight={saved ? 'fill' : 'regular'}
            />
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <Icon name="ph-star" size={11} color={colors.gold} weight="fill" />
          <Text style={styles.rating}>{p.rating.toFixed(1)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.service}>{p.service}</Text>
          <Text style={styles.dot}>·</Text>
          <Icon name="ph-map-pin" size={11} color={colors.muted} />
          <Text style={styles.area} numberOfLines={1}>
            {p.area}
          </Text>
        </View>

        <Text style={styles.desc} numberOfLines={1}>
          {p.description}
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.callBtn} onPress={() => call(p)}>
            <Icon name="ph-phone-call" size={13} color="#fff" weight="bold" />
            <Text style={styles.callText}>Call</Text>
          </Pressable>
          <Pressable style={styles.waBtn} onPress={() => whatsapp(p)}>
            <Icon name="ph-whatsapp-logo" size={13} color={colors.whatsapp} weight="fill" />
            <Text style={styles.waText}>WhatsApp</Text>
          </Pressable>
          <View style={styles.availWrap}>
            <View style={[styles.availDot, { backgroundColor: availColor }]} />
            <Text style={[styles.availText, { color: availColor }]} numberOfLines={1}>
              {availLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
    padding: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.10)',
    borderRadius: radius.lg + 1,
    ...shadowCard,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.text, flexShrink: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.soft,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { color: colors.success, fontSize: 10, fontFamily: fonts.bold },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  rating: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  dot: { color: colors.muted, opacity: 0.4, fontSize: 12 },
  service: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  area: { color: colors.muted, fontSize: 12, flexShrink: 1 },
  desc: { fontSize: 12, color: colors.muted, marginTop: 3, fontFamily: fonts.regular },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  callBtn: {
    height: 30,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: colors.green800,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  callText: { color: '#fff', fontSize: 12, fontFamily: fonts.bold },
  waBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(22,135,95,0.25)',
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  waText: { color: colors.whatsapp, fontSize: 12, fontFamily: fonts.bold },
  availWrap: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4 },
  availDot: { width: 6, height: 6, borderRadius: 999 },
  availText: { fontSize: 10.5, fontFamily: fonts.semibold },
});
