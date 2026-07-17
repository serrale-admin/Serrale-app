import type { Category, PastWork, Provider, Review } from '../types';

/**
 * Canonical service areas, aligned with the Basic WEB app's 9 locations
 * (frontend/public-directory/src/data/directory.mock.ts `serviceLocations`).
 *
 * The value stored here is the display name, which is ALSO what gets sent to the
 * backend as `?area=` (the backend matches with `ilike('area', value)` against
 * `directory_providers.area`, and the web sends `location.name` verbatim). The
 * first entry, `AREA_ALL` ("Addis Ababa"), is the city-wide sentinel: when it is
 * selected the `area` param is OMITTED entirely (browse the whole city), exactly
 * as the web omits `area` for its default `addis-ababa` location.
 */
export const AREA_ALL = 'Addis Ababa';

/** Canonical locations — display names match web `serviceLocations` / `locationNames`. */
export interface ServiceLocation {
  slug: string;
  name: string;
  am: string;
}

export const SERVICE_LOCATIONS: ServiceLocation[] = [
  { slug: 'addis-ababa', name: 'Addis Ababa', am: 'አዲስ አበባ' },
  { slug: 'bole', name: 'Bole', am: 'ቦሌ' },
  { slug: 'summit', name: 'Summit', am: 'ሰሚት' },
  { slug: 'cmc', name: 'CMC', am: 'ሲኤምሲ' },
  { slug: 'kazanchis', name: 'Kazanchis', am: 'ካዛንቺስ' },
  { slug: 'yeka', name: 'Yeka', am: 'የካ' },
  { slug: 'piassa', name: 'Piassa', am: 'ፒያሳ' },
  { slug: 'megenagna', name: 'Megenagna', am: 'መገናኛ' },
  { slug: 'ayat', name: 'Ayat', am: 'አያት' },
];

export const AREAS: string[] = SERVICE_LOCATIONS.map((location) => location.name);

/** Provider join area picker — excludes city-wide, same as web `/join`. */
export const JOIN_AREAS: string[] = SERVICE_LOCATIONS.filter((location) => location.slug !== 'addis-ababa').map(
  (location) => location.name,
);

export function locationDisplayName(areaName: string, useAmharic: boolean): string {
  const location = SERVICE_LOCATIONS.find((entry) => entry.name === areaName);
  if (!location) return areaName;
  return useAmharic ? location.am : location.name;
}

export const GROUP_NAMES = [
  'Home Services',
  'Repairs & Maintenance',
  'Moving & Transport',
  'Health & Wellness',
];

/**
 * Category presentation list keyed by the EXACT 24 backend ontology slugs
 * (backend/src/services/directorySearchOntology.ts). `id` === backend
 * `category_slug`; `name`/`am` are copied from the ontology's label_en/label_am.
 * `count` is a placeholder that live GET /categories `{ counts }` overwrites.
 *
 * Grouping and labels mirror the aligned web reference
 * (frontend/public-directory/src/data/directory.mock.ts). This is presentation
 * metadata only — it never stands in for live provider results.
 */
export const CATS: Category[] = [
  // ── Home Services ──────────────────────────────────────────────────────────
  { id: 'painters', name: 'Painters', am: 'ቀለም ቀቢዎች', icon: 'ph-paint-roller', count: 0, group: 'Home Services', subs: ['Interior', 'Exterior', 'Wall painting'] },
  { id: 'plumbers', name: 'Plumbers', am: 'የቧንቧ ባለሙያዎች', icon: 'ph-wrench', count: 0, group: 'Home Services', subs: ['Pipe repair', 'Leak repair', 'Toilet repair', 'Drain cleaning'] },
  { id: 'electricians', name: 'Electricians', am: 'የኤሌክትሪክ ባለሙያዎች', icon: 'ph-lightning', count: 0, group: 'Home Services', subs: ['Wiring', 'Lighting installation', 'Socket repair'] },
  { id: 'cleaners', name: 'Cleaners', am: 'የጽዳት ባለሙያዎች', icon: 'ph-sparkle', count: 0, group: 'Home Services', subs: ['House cleaning', 'Office cleaning', 'Deep cleaning'] },
  { id: 'nannies', name: 'Nannies', am: 'ሞግዚቶች', icon: 'ph-baby', count: 0, group: 'Home Services', subs: ['Babysitting', 'Live-in nanny', 'Child care'] },
  { id: 'carpenters', name: 'Carpenters', am: 'አናጢዎች', icon: 'ph-hammer', count: 0, group: 'Home Services', subs: ['Furniture making', 'Door repair', 'Cabinet making'] },
  { id: 'masons', name: 'Masons', am: 'የግንባታ ባለሙያዎች', icon: 'ph-wall', count: 0, group: 'Home Services', subs: ['Block work', 'Plastering', 'Concrete work'] },
  { id: 'welders', name: 'Welders', am: 'የብየዳ ባለሙያዎች', icon: 'ph-wrench', count: 0, group: 'Home Services', subs: ['Gate making', 'Grill work', 'Metal door'] },
  { id: 'cctv-installation', name: 'CCTV Installation', am: 'የሲሲቲቪ ተከላ', icon: 'ph-shield-check', count: 0, group: 'Home Services', subs: ['Camera installation', 'Security system setup'] },
  { id: 'home-repair', name: 'Home Repair', am: 'የቤት ጥገና', icon: 'ph-house', count: 0, group: 'Home Services', subs: ['General repair', 'Home maintenance', 'Small fixes'] },
  { id: 'gardeners', name: 'Gardeners', am: 'አትክልተኞች', icon: 'ph-plant', count: 0, group: 'Home Services', subs: ['Landscaping', 'Lawn care', 'Tree care'] },

  // ── Repairs & Maintenance ──────────────────────────────────────────────────
  { id: 'phone-repair', name: 'Phone Repair', am: 'የስልክ ጥገና', icon: 'ph-wrench', count: 0, group: 'Repairs & Maintenance', subs: ['Screen replacement', 'Battery replacement', 'Software fix'] },
  { id: 'computer-repair', name: 'Computer Repair', am: 'የኮምፒውተር ጥገና', icon: 'ph-wrench', count: 0, group: 'Repairs & Maintenance', subs: ['Laptop repair', 'Hardware repair', 'Software installation'] },
  { id: 'appliance-repair', name: 'Appliance Repair', am: 'የቤት መሳሪያ ጥገና', icon: 'ph-wrench', count: 0, group: 'Repairs & Maintenance', subs: ['Fridge repair', 'Washing machine repair', 'Oven repair'] },
  { id: 'generator-repair', name: 'Generator Repair', am: 'የጀነሬተር ጥገና', icon: 'ph-lightning', count: 0, group: 'Repairs & Maintenance', subs: ['Generator servicing', 'Power backup setup'] },
  { id: 'car-mechanics', name: 'Car Mechanics', am: 'የመኪና መካኒኮች', icon: 'ph-wrench', count: 0, group: 'Repairs & Maintenance', subs: ['Engine repair', 'Brake service', 'Oil change'] },

  // ── Moving & Transport ─────────────────────────────────────────────────────
  { id: 'drivers', name: 'Drivers', am: 'ሹፌሮች', icon: 'ph-steering-wheel', count: 0, group: 'Moving & Transport', subs: ['Personal driver', 'Company driver'] },
  { id: 'moving-service', name: 'Moving Service', am: 'የእቃ ማንቀሳቀስ አገልግሎት', icon: 'ph-truck', count: 0, group: 'Moving & Transport', subs: ['House moving', 'Office moving', 'Packing'] },
  { id: 'truck-rental', name: 'Truck Rental', am: 'የጭነት መኪና ኪራይ', icon: 'ph-truck', count: 0, group: 'Moving & Transport', subs: ['Pickup rental', 'Cargo truck', 'Isuzu rental'] },
  { id: 'delivery-service', name: 'Delivery Service', am: 'የዴሊቨሪ አገልግሎት', icon: 'ph-package', count: 0, group: 'Moving & Transport', subs: ['Package delivery', 'Courier service', 'Item transport'] },

  // ── Health & Wellness ──────────────────────────────────────────────────────
  { id: 'home-care-nurses', name: 'Home Care Nurses', am: 'የቤት እንክብካቤ ነርሶች', icon: 'ph-first-aid', count: 0, group: 'Health & Wellness', subs: ['Home nursing', 'Medication management', 'Injection'] },
  { id: 'caregivers', name: 'Caregivers', am: 'ተንከባካቢዎች', icon: 'ph-hand-heart', count: 0, group: 'Health & Wellness', subs: ['Elderly care', 'Patient care', 'Home support'] },
  { id: 'physiotherapists', name: 'Physiotherapists', am: 'የፊዚዮቴራፒ ባለሙያዎች', icon: 'ph-heartbeat', count: 0, group: 'Health & Wellness', subs: ['Rehabilitation', 'Massage therapy', 'Physical therapy'] },
  { id: 'personal-trainers', name: 'Personal Trainers', am: 'የግል አሰልጣኞች', icon: 'ph-barbell', count: 0, group: 'Health & Wellness', subs: ['Fitness coaching', 'Gym training', 'Home workout'] },
];

/** Exact ontology slug list — the source of truth GET /categories counts key on. */
export const CATEGORY_SLUGS: string[] = CATS.map((c) => c.id);

/**
 * Demo providers — MOCK MODE ONLY. In live mode the app never renders these
 * (they carry rating/reviewCount/price/availability fields the live backend row
 * does not expose — see contract matrix M-3). Slugs match the ontology so mock
 * category filtering keeps working.
 */
export const PROV: Provider[] = [
  { id: 'tekle-plumbing', name: 'Tekle Plumbing', service: 'Plumber', categoryId: 'plumbers', rating: 4.9, reviewCount: 256, area: 'Bole', verified: true, adminReviewed: true, availableToday: true, hasPastWork: true, exp: 8, price: 'Standard', description: 'Pipe leaks, sink repair, and water pressure.', phone: '+251911234567', engagementTypes: ['temporary', 'permanent'] },
  { id: 'abebe-painting', name: 'Abebe Painting', service: 'Painter', categoryId: 'painters', rating: 4.8, reviewCount: 128, area: 'Piassa', verified: true, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 6, price: 'Budget', description: 'Interior painting, wall finishing, small repairs.', phone: '+251911234568', engagementTypes: ['temporary'] },
  { id: 'amanuel-electric', name: 'Amanuel Electric', service: 'Electrician', categoryId: 'electricians', rating: 4.8, reviewCount: 173, area: 'CMC', verified: true, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 10, price: 'Standard', description: 'Switch repair, wiring, lighting, installation.', phone: '+251911234569', engagementTypes: ['temporary', 'permanent'] },
  { id: 'bethel-cleaning', name: 'Bethel Cleaning', service: 'Cleaner', categoryId: 'cleaners', rating: 4.7, reviewCount: 146, area: 'Yeka', verified: true, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 4, price: 'Budget', description: 'Home, office, deep cleaning, and support.', phone: '+251911234570', engagementTypes: ['temporary'] },
  { id: 'hanna-childcare', name: 'Hanna Childcare', service: 'Nanny', categoryId: 'nannies', rating: 4.9, reviewCount: 89, area: 'Bole', verified: true, adminReviewed: true, availableToday: true, hasPastWork: true, exp: 7, price: 'Standard', description: 'Experienced daytime and full-time care.', phone: '+251911234571', engagementTypes: ['permanent'] },
  { id: 'yonas-carpentry', name: 'Yonas Carpentry', service: 'Carpenter', categoryId: 'carpenters', rating: 4.6, reviewCount: 64, area: 'Kazanchis', verified: false, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 5, price: 'Standard', description: 'Custom furniture, doors, shelves, repairs.', phone: '+251911234572', engagementTypes: ['temporary', 'permanent'] },
  { id: 'selam-appliance', name: 'Selam Appliance', service: 'Appliance Repair', categoryId: 'appliance-repair', rating: 4.7, reviewCount: 112, area: 'Summit', verified: true, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 9, price: 'Standard', description: 'Fridge, washing machine, and stove repair.', phone: '+251911234573', engagementTypes: ['temporary'] },
  { id: 'dawit-movers', name: 'Dawit Movers', service: 'Mover', categoryId: 'moving-service', rating: 4.5, reviewCount: 78, area: 'Megenagna', verified: false, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 3, price: 'Budget', description: 'House and office moving, careful handling.', phone: '+251911234574', engagementTypes: ['temporary'] },
  { id: 'meron-mechanic', name: 'Meron Auto', service: 'Car Mechanic', categoryId: 'car-mechanics', rating: 4.8, reviewCount: 141, area: 'Ayat', verified: true, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 11, price: 'Standard', description: 'Engine, brake, and oil-change service.', phone: '+251911234575', engagementTypes: ['temporary', 'permanent'] },
  { id: 'robel-electric', name: 'Robel Electric', service: 'Electrician', categoryId: 'electricians', rating: 4.6, reviewCount: 54, area: 'Yeka', verified: false, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 4, price: 'Budget', description: 'Lighting, breaker, and home wiring fixes.', phone: '+251911234576', engagementTypes: ['temporary'] },
  { id: 'sara-cleaning', name: 'Sara Cleaning', service: 'Cleaner', categoryId: 'cleaners', rating: 4.8, reviewCount: 97, area: 'Piassa', verified: true, adminReviewed: true, availableToday: true, hasPastWork: true, exp: 6, price: 'Standard', description: 'Move-in and deep cleaning specialist.', phone: '+251911234577', engagementTypes: ['temporary', 'permanent'] },
  { id: 'kbrom-plumbing', name: 'Kbrom Plumbing', service: 'Plumber', categoryId: 'plumbers', rating: 4.7, reviewCount: 132, area: 'Bole', verified: true, adminReviewed: false, availableToday: false, hasPastWork: true, exp: 7, price: 'Standard', description: 'Bathroom, kitchen, and emergency plumbing.', phone: '+251911234578', engagementTypes: ['temporary', 'permanent'] },
];

/** Demo reviews — MOCK MODE ONLY (live provider rows carry no reviews). */
export const REVIEWS: Review[] = [
  { providerId: 'tekle-plumbing', userName: 'Marta', area: 'Bole', rating: 5, text: 'Found him quickly and the sink repair was done the same day.' },
  { providerId: 'tekle-plumbing', userName: 'Henok', area: 'Bole', rating: 5, text: 'On time and fair price. Highly recommend.' },
  { providerId: 'abebe-painting', userName: 'Daniel', area: 'Piassa', rating: 5, text: 'Clean finishing and professional communication.' },
  { providerId: 'abebe-painting', userName: 'Sara', area: 'Piassa', rating: 4, text: 'Good work, finished in two days as promised.' },
  { providerId: 'hanna-childcare', userName: 'Liya', area: 'Bole', rating: 5, text: 'Very caring and reliable with my daughter.' },
];

/** Demo past work — MOCK MODE ONLY (live provider rows carry no portfolio). */
export const PASTWORK: PastWork[] = [
  { providerId: 'abebe-painting', title: 'Kitchen repaint in Bole', category: 'Painting', area: 'Bole', icon: 'ph-paint-roller', bg: '#086246', note: 'Completed in 2 days with clean finishing.' },
  { providerId: 'tekle-plumbing', title: 'Bathroom leak repair', category: 'Plumbing', area: 'Yeka', icon: 'ph-wrench', bg: '#064734', note: 'Fixed pipe leak and water pressure issue.' },
  { providerId: 'yonas-carpentry', title: 'Custom wardrobe build', category: 'Carpentry', area: 'Kazanchis', icon: 'ph-hammer', bg: '#0b5a40', note: 'Built and fitted a full bedroom wardrobe.' },
  { providerId: 'bethel-cleaning', title: 'Office deep clean', category: 'Cleaning', area: 'Yeka', icon: 'ph-sparkle', bg: '#16875F', note: 'Full office deep clean over a weekend.' },
];
