import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SERVICE_LOCATIONS, locationDisplayName } from '../data/mock';
import { FieldLabel, TextField } from './Field';
import { useLabels } from '../lib/labels';
import type { BasicProfileForm as BasicProfileValues } from '../schemas/basic-profile';
import { colors, fonts, radius } from '../lib/theme';
import { useAppStore } from '../store/appStore';

interface Props {
  value: BasicProfileValues;
  phoneDisplay: string;
  onChange(patch: Partial<BasicProfileValues>): void;
  disabled?: boolean;
}

export default function BasicProfileForm({ value, phoneDisplay, onChange, disabled }: Props) {
  const labels = useLabels();
  const t = labels.clientProfile;
  const am = useAppStore((s) => s.lang) === 'am';
  const areas = SERVICE_LOCATIONS.filter((l) => l.slug !== 'addis-ababa');

  return (
    <View style={styles.stack}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.basicSectionYou}</Text>
        <FieldLabel compact>{t.fullName}</FieldLabel>
        <TextField
          value={value.display_name}
          onChangeText={(display_name) => onChange({ display_name })}
          placeholder={t.fullNamePlaceholder}
          editable={!disabled}
        />
        <FieldLabel compact>{t.phone}</FieldLabel>
        <TextField value={phoneDisplay} editable={false} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.basicSectionArea}</Text>
        <Text style={styles.sectionHint}>{t.basicAreaHint}</Text>
        <View style={styles.areaGrid}>
          {areas.map((area) => {
            const active = value.area_slug === area.slug;
            return (
              <Pressable
                key={area.slug}
                style={[styles.areaChip, active && styles.areaChipActive]}
                onPress={() => onChange({ area_slug: area.slug })}
                disabled={disabled}
              >
                <Text style={[styles.areaChipText, active && styles.areaChipTextActive]}>
                  {locationDisplayName(area.name, am)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  section: {
    backgroundColor: colors.ivory,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 14,
    gap: 8,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.green900, marginBottom: 2 },
  sectionHint: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted, marginBottom: 4 },
  areaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.surface,
  },
  areaChipActive: { borderColor: colors.green800, backgroundColor: colors.soft },
  areaChipText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.muted },
  areaChipTextActive: { color: colors.green800 },
});
