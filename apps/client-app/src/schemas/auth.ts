import { z } from 'zod';
import { normalizeEthiopianPhone } from '../api/auth';

export const phoneSchema = z.object({
  phone: z
    .string()
    .refine((v) => normalizeEthiopianPhone(v) !== null, 'Enter a valid Ethiopian phone number.'),
});

export type PhoneForm = z.infer<typeof phoneSchema>;
