import { z } from 'zod';

export const requestSchema = z.object({
  categoryId: z.string().min(1, 'Choose a service'),
  area: z.string().min(1, 'Choose an area'),
  // Optional: the selected service/category is enough to submit a request.
  description: z.string().trim().max(300).optional().default(''),
  // Optional — distinct from `when` (urgency). A user may not know or care to
  // specify temporary vs permanent; '' means not specified.
  engagement: z.enum(['', 'Temporary', 'Permanent']),
  when: z.enum(['Emergency', 'Today', 'This week', 'Flexible']),
  budget: z.string(),
  preferredContact: z.enum(['Call', 'WhatsApp', 'Both']),
});

export type RequestForm = z.infer<typeof requestSchema>;

export const defaultRequest = (area: string): RequestForm => ({
  categoryId: '',
  area,
  description: '',
  engagement: '',
  when: 'Today',
  budget: '',
  preferredContact: 'Both',
});
