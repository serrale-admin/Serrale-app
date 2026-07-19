export async function fetchNotifications() {
  return { items: [], unread_count: 0 };
}
export async function markNotificationRead() {}
export async function markAllNotificationsRead() {}
export async function registerPushToken() {
  return { id: 'mock' };
}
export async function fetchCustomerTrust(customerId: string) {
  return {
    customer: {
      id: customerId,
      display_name: 'Mock Client',
      client_type: 'individual',
      company_name: null,
      area_slug: 'bole',
      avg_rating: null,
      review_count: 0,
      member_since: new Date().toISOString(),
    },
    reviews: [],
  };
}
export async function fetchCustomerReviewEligibility() {
  return { status: 'eligible' as const };
}
export async function submitCustomerReview() {
  return { review: null, avg_rating: null, review_count: 0 };
}
export async function reportCustomer() {
  return { id: 'mock', status: 'open' };
}
export async function fetchSharedLeads() {
  return { leads: [] };
}
export async function logLeadContact() {
  return { recorded: true };
}
