import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SERVICE_LOCATIONS } from '../data/mock';
import { locationDisplayName } from '../data/mock';
import { FieldLabel, TextField } from './Field';
import { useLabels } from '../lib/labels';
import type { HiringProfileForm as HiringProfileValues } from '../schemas/hiring-profile';
import { colors, fonts, radius } from '../lib/theme';
import { useAppStore } from '../store/appStore';

interface Props {
  value: HiringProfileValues;
  phoneDisplay: string;
  onChange(patch: Partial<HiringProfileValues>): void;
  disabled?: boolean;
}

export default function HiringProfileForm({ value, phoneDisplay, onChange, disabled }: Props) {
  const labels = useLabels();
  const t = labels.clientProfile;
  const am = useAppStore((s) => s.lang) === 'am';
  const areas = SERVICE_LOCATIONS.filter((l) => l.slug !== 'addis-ababa');

  const setType = (client_type: 'individual' | 'company') => {
    onChange({
      client_type,
      company_name: client_type === 'company' ? value.company_name : '',
      id_number: client_type === 'individual' ? value.id_number : '',
      id_document_url: client_type === 'individual' ? value.id_document_url : '',
      business_license_number: client_type === 'company' ? value.business_license_number : '',
      business_license_url: client_type === 'company' ? value.business_license_url : '',
    });
  };

  return (
    <View style={styles.stack}>
      <FieldLabel compact>{t.profileType}</FieldLabel>
      <View style={styles.typeRow}>
        {(['individual', 'company'] as const).map((type) => {
          const active = value.client_type === type;
          return (
            <Pressable
              key={type}
              style={[styles.typeChip, active && styles.typeChipActive]}
              onPress={() => setType(type)}
              disabled={disabled}
            >
              <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                {type === 'individual' ? t.individual : t.company}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FieldLabel compact>{value.client_type === 'company' ? t.contactName : t.fullName}</FieldLabel>
      <TextField
        value={value.display_name}
        onChangeText={(display_name) => onChange({ display_name })}
        editable={!disabled}
      />

      {value.client_type === 'company' && (
        <>
          <FieldLabel compact>{t.companyName}</FieldLabel>
          <TextField
            value={value.company_name || ''}
            onChangeText={(company_name) => onChange({ company_name })}
            editable={!disabled}
          />
        </>
      )}

      <FieldLabel compact>{t.phone}</FieldLabel>
      <TextField value={phoneDisplay} editable={false} />

      <FieldLabel compact>{t.area}</FieldLabel>
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
              <Text style={[styles.areaChipText, active && styles.areaChipTextActive]}>{locationDisplayName(area.name, am)}</Text>
            </Pressable>
          );
        })}
      </View>

      {value.client_type === 'individual' ? (
        <>
          <FieldLabel compact>{t.idNumber}</FieldLabel>
          <TextField
            value={value.id_number || ''}
            onChangeText={(id_number) => onChange({ id_number })}
            placeholder={t.idNumberPlaceholder}
            editable={!disabled}
          />
          <FieldLabel compact optional>
            {t.idPhoto}
          </FieldLabel>
          <TextField
            value={value.id_document_url || ''}
            onChangeText={(id_document_url) => onChange({ id_document_url })}
            placeholder={t.docPlaceholder}
            editable={!disabled}
          />
        </>
      ) : (
        <>
          <FieldLabel compact>{t.licenseNumber}</FieldLabel>
          <TextField
            value={value.business_license_number || ''}
            onChangeText={(business_license_number) => onChange({ business_license_number })}
            placeholder={t.licenseNumberPlaceholder}
            editable={!disabled}
          />
          <FieldLabel compact optional>
            {t.licensePhoto}
          </FieldLabel>
          <TextField
            value={value.business_license_url || ''}
            onChangeText={(business_license_url) => onChange({ business_license_url })}
            placeholder={t.docPlaceholder}
            editable={!disabled}
          />
        </>
      )}

      <Text style={styles.hint}>{t.privateDocsHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  typeChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  typeChipActive: { borderColor: colors.green800, backgroundColor: colors.soft },
  typeChipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  typeChipTextActive: { color: colors.green800 },
  areaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  areaChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  areaChipActive: { borderColor: colors.green800, backgroundColor: colors.soft },
  areaChipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  areaChipTextActive: { color: colors.green800 },
  hint: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.muted, marginTop: 4 },
});
