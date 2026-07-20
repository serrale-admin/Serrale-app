import { z } from 'zod';

export const providerProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is required').max(120),
  categorySlug: z.string().min(1, 'Category is required'),
  area: z.string().min(1, 'Area is required'),
  whatsapp: z.string().max(32).optional(),
  experience: z.string().max(160).optional(),
  description: z.string().max(1200).optional(),
  providerType: z.enum(['individual', 'business']),
  engagementTypes: z.array(z.enum(['temporary', 'permanent'])).min(1, 'Select at least one work type'),
});

export type ProviderProfileFormValues = z.infer<typeof providerProfileSchema>;

export const defaultProviderProfile = (): ProviderProfileFormValues => ({
  fullName: '',
  categorySlug: '',
  area: '',
  whatsapp: '',
  experience: '',
  description: '',
  providerType: 'individual',
  engagementTypes: ['temporary', 'permanent'],
});

export function providerProfileToApiPatch(value: ProviderProfileFormValues) {
  return {
    fullName: value.fullName.trim(),
    categorySlug: value.categorySlug,
    area: value.area.trim(),
    whatsappNumber: value.whatsapp?.trim() || undefined,
    experience: value.experience?.trim() || undefined,
    description: value.description?.trim() || undefined,
    providerType: value.providerType,
    engagementTypes: value.engagementTypes,
  };
}
