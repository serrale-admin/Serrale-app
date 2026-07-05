import { z } from 'zod';
import { isValidEthiopianPhone, PHONE_INVALID_MESSAGE } from '../lib/phone';

export const phoneSchema = z.object({
  // Validates INLINE, before any network call — the API layer re-checks anyway.
  phone: z.string().refine(isValidEthiopianPhone, PHONE_INVALID_MESSAGE),
});

export type PhoneForm = z.infer<typeof phoneSchema>;
