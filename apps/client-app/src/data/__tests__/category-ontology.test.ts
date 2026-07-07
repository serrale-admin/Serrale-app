import { AREA_ALL, AREAS, CATEGORY_SLUGS, CATS, GROUP_NAMES } from '../mock';

/**
 * Snapshot of the authoritative Basic category ontology —
 * backend/src/services/directorySearchOntology.ts (serrale repo, read-only).
 * slug → [label_en, label_am], copied verbatim. If the backend ontology changes,
 * this snapshot (and src/data/mock.ts) must be updated together.
 */
const BACKEND_ONTOLOGY: Record<string, [string, string]> = {
  painters: ['Painters', 'ቀለም ቀቢዎች'],
  plumbers: ['Plumbers', 'ቧንቧ ሰራተኞች'],
  electricians: ['Electricians', 'ኤሌክትሪሺያኖች'],
  cleaners: ['Cleaners', 'አጽጂዎች'],
  nannies: ['Nannies', 'ሞግዚቶች'],
  carpenters: ['Carpenters', 'አናጺዎች'],
  masons: ['Masons', 'ግንበኞች'],
  welders: ['Welders', 'ብየዳ ሰራተኞች'],
  'cctv-installation': ['CCTV Installation', 'ሲሲቲቪ ተከላ'],
  'home-repair': ['Home Repair', 'የቤት ጥገና'],
  gardeners: ['Gardeners', 'አትክልተኞች'],
  drivers: ['Drivers', 'አሽከርካሪዎች'],
  'home-care-nurses': ['Home Care Nurses', 'የቤት ነርሶች'],
  caregivers: ['Caregivers', 'እንክብካቤ ሰጪዎች'],
  'moving-service': ['Moving Service', 'የማዛወር አገልግሎት'],
  'truck-rental': ['Truck Rental', 'የጭነት መኪና ኪራይ'],
  'delivery-service': ['Delivery Service', 'የማድረስ አገልግሎት'],
  'phone-repair': ['Phone Repair', 'የስልክ ጥገና'],
  'computer-repair': ['Computer Repair', 'የኮምፒውተር ጥገና'],
  'appliance-repair': ['Appliance Repair', 'የዕቃ ጥገና'],
  'generator-repair': ['Generator Repair', 'የጄኔሬተር ጥገና'],
  'car-mechanics': ['Car Mechanics', 'የመኪና መካኒኮች'],
  physiotherapists: ['Physiotherapists', 'ፊዚዮቴራፒስቶች'],
  'personal-trainers': ['Personal Trainers', 'የግል አሰልጣኞች'],
};

/** Phantom categories that must never reappear (unknown to the backend). */
const PHANTOM_SLUGS = [
  'designers', 'developers', 'marketing', 'makeup', 'photographers',
  'tailors', 'cooks', 'laundry', 'locksmiths', 'pest', 'appliance', 'movers',
];

/** The 9 canonical areas from the aligned web app (serviceLocations names). */
const CANONICAL_AREAS = ['Addis Ababa', 'Ayat', 'Bole', 'CMC', 'Kazanchis', 'Megenagna', 'Piassa', 'Summit', 'Yeka'];

describe('category ontology alignment (Task 5 amendment)', () => {
  it('has exactly the 24 backend ontology slugs — no more, no less', () => {
    const backendSlugs = Object.keys(BACKEND_ONTOLOGY).sort();
    const mobileSlugs = CATS.map((c) => c.id).sort();
    expect(mobileSlugs).toEqual(backendSlugs);
    expect(CATS).toHaveLength(24);
    expect(new Set(mobileSlugs).size).toBe(24);
  });

  it('exports CATEGORY_SLUGS mirroring the list', () => {
    expect(CATEGORY_SLUGS).toEqual(CATS.map((c) => c.id));
  });

  it('copies label_en and label_am verbatim from the ontology', () => {
    for (const c of CATS) {
      const [en, am] = BACKEND_ONTOLOGY[c.id];
      expect(c.name).toBe(en);
      expect(c.am).toBe(am);
    }
  });

  it('contains none of the 12 phantom categories', () => {
    const ids = new Set(CATS.map((c) => c.id));
    for (const phantom of PHANTOM_SLUGS) {
      expect(ids.has(phantom)).toBe(false);
    }
  });

  it('assigns every category to one of the four web-aligned groups', () => {
    expect(GROUP_NAMES).toEqual(['Home Services', 'Repairs & Maintenance', 'Moving & Transport', 'Health & Wellness']);
    for (const c of CATS) {
      expect(GROUP_NAMES).toContain(c.group);
    }
  });

  it('aligns AREAS to the web app’s 9 canonical locations, city-wide first', () => {
    expect(AREAS).toHaveLength(9);
    expect([...AREAS].sort()).toEqual([...CANONICAL_AREAS].sort());
    expect(AREAS[0]).toBe(AREA_ALL);
    expect(AREA_ALL).toBe('Addis Ababa');
  });

  it('keeps demo providers on ontology slugs and canonical areas (mock-mode integrity)', () => {
    const ids = new Set(CATS.map((c) => c.id));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PROV } = require('../mock');
    for (const p of PROV) {
      expect(ids.has(p.categoryId)).toBe(true);
      expect(CANONICAL_AREAS).toContain(p.area);
    }
  });
});
