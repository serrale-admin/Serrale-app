import { z } from 'zod';

export const requestSchema = z.object({
  categoryId: z.string().min(1, 'Choose a service'),
  area: z.string().min(1, 'Choose an area'),
  description: z.string().trim().min(1, 'Describe the work briefly').max(300),
  when: z.enum(['Emergency', 'Today', 'This week', 'Flexible']),
  budget: z.string(),
  preferredContact: z.enum(['Call', 'WhatsApp', 'Both']),
});

export type RequestForm = z.infer<typeof requestSchema>;

export const defaultRequest = (area: string): RequestForm => ({
  categoryId: '',
  area,
  description: '',
  when: 'Today',
  budget: '',
  preferredContact: 'Both',
});
