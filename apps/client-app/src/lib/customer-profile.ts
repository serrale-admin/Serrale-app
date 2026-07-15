import { displayEthiopianPhone } from './phone';

/** Minimal customer profile fields used for display name resolution. */
export interface CustomerNameFields {
  display_name?: string | null;
  company_name?: string | null;
  phone: string;
}

/**
 * Resolve the customer-facing display name from API profile fields.
 * Falls back to formatted phone — never the generic "SERRALE user" placeholder.
 */
export function customerDisplayName(customer: CustomerNameFields): string {
  const personal = customer.display_name?.trim();
  if (personal) return personal;
  const company = customer.company_name?.trim();
  if (company) return company;
  return displayEthiopianPhone(customer.phone) || customer.phone;
}

export function isCustomerProfileComplete(customer: { profile_complete?: boolean | null }): boolean {
  return customer.profile_complete === true;
}
