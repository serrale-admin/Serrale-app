import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CATS, JOIN_AREAS } from '../data/mock';
import { areaLabel, categoryLabel } from '../lib/directory-display';
import { useLabels } from '../lib/labels';
import { colors, fonts, radius } from '../lib/theme';
import type { ProviderProfileFormValues } from '../schemas/provider-profile';
import { useAppStore } from '../store/appStore';
import CategorySheet from './CategorySheet';
import { EthiopianPhoneField, FieldLabel, FormTextArea, SelectField, TextField } from './Field';
import LocationSheet from './LocationSheet';

interface Props {
  value: ProviderProfileFormValues;
  phoneDisplay: string;
  onChange(patch: Partial<ProviderProfileFormValues>): void;
  disabled?: boolean;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function ProviderProfileForm({ value, phoneDisplay, onChange, disabled }: Props) {
  const labels = useLabels();
  const t = labels.providerJoin;
  const p = labels.profile;
  const am = useAppStore((s) => s.lang) === 'am';
  const [showCategory, setShowCategory] = useState(false);
  const [showArea, setShowArea] = useState(false);

  const category = CATS.find((c) => c.id === value.categorySlug);
  const categoryText = category ? categoryLabel(category, am) : '';

  return (
    <View style={styles.stack}>
      <SectionCard title={t.sectionContact}>
        <FieldLabel compact>{t.fullName}</FieldLabel>
        <TextField value={value.fullName} onChangeText={(fullName) => onChange({ fullName })} editable={!disabled} />
        <FieldLabel compact>{t.phone}</FieldLabel>
        <TextField value={phoneDisplay} editable={false} />
        <EthiopianPhoneField
          label={t.whatsapp}
          optional
          compact
          value={value.whatsapp || ''}
          onChangeText={(whatsapp) => onChange({ whatsapp })}
        />
      </SectionCard>

      <SectionCard title={t.sectionService}>
        <FieldLabel compact>{t.serviceCategory}</FieldLabel>
        <SelectField
          value={categoryText}
          placeholder={t.selectCategory}
          onPress={() => !disabled && setShowCategory(true)}
        />
        <FieldLabel compact>{t.area}</FieldLabel>
        <SelectField
          value={value.area ? areaLabel(value.area, am) : ''}
          placeholder={t.selectArea}
          onPress={() => !disabled && setShowArea(true)}
        />
        <FieldLabel compact optional>
          {t.experience}
        </FieldLabel>
        <TextField
          value={value.experience || ''}
          onChangeText={(experience) => onChange({ experience })}
          placeholder={t.experienceExample}
          editable={!disabled}
        />
        <FormTextArea
          label={p.listingBio}
          optional
          compact
          value={value.description || ''}
          onChangeText={(description) => onChange({ description })}
          editable={!disabled}
        />
      </SectionCard>

      <Text style={styles.hint}>{p.phoneLocked}</Text>

      <CategorySheet
        visible={showCategory}
        onClose={() => setShowCategory(false)}
        value={value.categorySlug}
        onSelect={(categorySlug) => onChange({ categorySlug })}
      />
      <LocationSheet
        visible={showArea}
        onClose={() => setShowArea(false)}
        value={value.area}
        onSelect={(area) => onChange({ area })}
        areas={JOIN_AREAS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  section: {
    backgroundColor: colors.ivory,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 14,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.green900, marginBottom: 10 },
  sectionBody: { gap: 8 },
  hint: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, color: colors.muted, paddingHorizontal: 2 },
});
