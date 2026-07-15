import { z } from 'zod';

/** Mobile basic customer profile — name + area only (no ID / license KYC on app). */
export const basicProfileSchema = z.object({
  display_name: z.string().trim().min(1, 'Name is required').max(120),
  area_slug: z.string().min(1, 'Area is required'),
});

export type BasicProfileForm = z.infer<typeof basicProfileSchema>;

export const defaultBasicProfile = (): BasicProfileForm => ({
  display_name: '',
  area_slug: '',
});

export function basicProfileToApiPayload(value: BasicProfileForm) {
  return {
    client_type: 'individual' as const,
    display_name: value.display_name.trim(),
    area_slug: value.area_slug,
    company_name: null,
    id_number: null,
    id_document_url: null,
    business_license_number: null,
    business_license_url: null,
  };
}
