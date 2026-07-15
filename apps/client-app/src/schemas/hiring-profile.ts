import { z } from 'zod';

export const hiringProfileSchema = z
  .object({
    client_type: z.enum(['individual', 'company']),
    display_name: z.string().trim().min(1, 'Name is required').max(120),
    company_name: z.string().max(160).optional(),
    area_slug: z.string().min(1, 'Area is required'),
    id_number: z.string().max(80).optional(),
    id_document_url: z.string().max(500).optional(),
    business_license_number: z.string().max(80).optional(),
    business_license_url: z.string().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.client_type === 'individual') {
      if (!value.id_number?.trim() && !value.id_document_url?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'ID number or document reference required', path: ['id_number'] });
      }
    } else if (!value.company_name?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Company name is required', path: ['company_name'] });
    } else if (!value.business_license_number?.trim() && !value.business_license_url?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'License number or document reference required', path: ['business_license_number'] });
    }
  });

export type HiringProfileForm = z.infer<typeof hiringProfileSchema>;

export const defaultHiringProfile = (): HiringProfileForm => ({
  client_type: 'individual',
  display_name: '',
  company_name: '',
  area_slug: '',
  id_number: '',
  id_document_url: '',
  business_license_number: '',
  business_license_url: '',
});

export function hiringProfileToApiPayload(value: HiringProfileForm) {
  return {
    client_type: value.client_type,
    display_name: value.display_name.trim(),
    company_name: value.client_type === 'company' ? value.company_name?.trim() || null : null,
    area_slug: value.area_slug || null,
    id_number: value.client_type === 'individual' ? value.id_number?.trim() || null : null,
    id_document_url: value.client_type === 'individual' ? value.id_document_url?.trim() || null : null,
    business_license_number: value.client_type === 'company' ? value.business_license_number?.trim() || null : null,
    business_license_url: value.client_type === 'company' ? value.business_license_url?.trim() || null : null,
  };
}
